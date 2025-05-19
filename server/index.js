require("dotenv").config();
const connectDB = require("./db");
connectDB();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes simples
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Inscription
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, wins: 0, games: 0 });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Connexion
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour le classement (top 10 joueurs)
app.get("/api/leaderboard", async (req, res) => {
  try {
    const topPlayers = await User.find({}, "username wins games")
      .sort({ wins: -1, games: 1 })
      .limit(10)
      .lean();
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors du chargement du classement." });
  }
});

// WebSocket pour duels, matchmaking, chat
let users = {};
let duels = {}; // { roomId: { players: [socketId1, socketId2], codes: {}, guesses: {} } }

io.on("connection", (socket) => {
  console.log("Utilisateur connecté :", socket.id);

  // Identification utilisateur
  socket.on("identify", (username) => {
    users[username] = socket.id;
    io.emit("userList", Object.keys(users));
  });

  // Envoi invitation duel
  socket.on("duelRequest", ({ from, to }) => {
    const toSocket = users[to];
    if (toSocket) io.to(toSocket).emit("duelRequestReceived", { from });
  });

  // Réponse à l'invitation
  socket.on("duelResponse", ({ from, to, accepted }) => {
    const toSocket = users[to];
    if (toSocket) io.to(toSocket).emit("duelResponseReceived", { from, accepted });
  });

  // Chat en temps réel
  socket.on("chatMessage", ({ username, message }) => {
    io.emit("chatMessage", { username, message });
  });

  // Démarrage duel
  socket.on("startDuelGame", ({ opponent, code, username }) => {
    const opponentSocket = users[opponent];
    if (!opponentSocket) return;

    const roomId = [socket.id, opponentSocket].sort().join("-");
    socket.join(roomId);
    io.to(opponentSocket).socketsJoin(roomId);

    if (!duels[roomId]) {
      duels[roomId] = {
        players: [socket.id],
        codes: { [socket.id]: code },
        guesses: {},
        usernames: { [socket.id]: username },
      };
    } else {
      duels[roomId].players.push(socket.id);
      duels[roomId].codes[socket.id] = code;
      duels[roomId].usernames[socket.id] = username;
    }

    // Commencer duel si 2 codes reçus
    if (Object.keys(duels[roomId].codes).length === 2) {
      io.to(roomId).emit("duelStarted", { roomId });
    }
  });

  // Réception proposition
  socket.on("submitGuess", async ({ roomId, guess }) => {
    const duel = duels[roomId];
    if (!duel) return;

    const opponentId = duel.players.find((p) => p !== socket.id);
    const opponentCode = duel.codes[opponentId];

    const result = checkGuess(opponentCode, guess);

    io.to(socket.id).emit("guessResult", { guess, result });

    if (guess === opponentCode) {
      io.to(roomId).emit("duelEnded", {
        winner: duel.usernames[socket.id],
        code: opponentCode,
      });

      // Mise à jour des stats
      try {
        const winnerUser = await User.findOne({ username: duel.usernames[socket.id] });
        const loserUser = await User.findOne({ username: duel.usernames[opponentId] });
        if (winnerUser && loserUser) {
          winnerUser.wins = (winnerUser.wins || 0) + 1;
          winnerUser.games = (winnerUser.games || 0) + 1;
          loserUser.games = (loserUser.games || 0) + 1;
          await winnerUser.save();
          await loserUser.save();
        }
      } catch (e) {
        console.error("Erreur mise à jour stats :", e);
      }

      delete duels[roomId];
    }
  });

  // Abandon
  socket.on("abandon", async ({ roomId }) => {
    const duel = duels[roomId];
    if (!duel) return;

    const opponentId = duel.players.find((p) => p !== socket.id);
    io.to(roomId).emit("duelEnded", {
      winner: duel.usernames[opponentId],
      abandon: true,
    });

    // Mise à jour des stats (victoire pour l'autre joueur)
    try {
      const winnerUser = await User.findOne({ username: duel.usernames[opponentId] });
      const loserUser = await User.findOne({ username: duel.usernames[socket.id] });
      if (winnerUser && loserUser) {
        winnerUser.wins = (winnerUser.wins || 0) + 1;
        winnerUser.games = (winnerUser.games || 0) + 1;
        loserUser.games = (loserUser.games || 0) + 1;
        await winnerUser.save();
        await loserUser.save();
      }
    } catch (e) {
      console.error("Erreur mise à jour stats après abandon :", e);
    }

    delete duels[roomId];
  });

  socket.on("disconnect", () => {
    for (const user in users) {
      if (users[user] === socket.id) delete users[user];
    }
    io.emit("userList", Object.keys(users));
    console.log("Utilisateur déconnecté :", socket.id);
  });
});

function checkGuess(secret, guess) {
  let correct = 0,
    wellPlaced = 0;
  const s = secret.split("");
  const g = guess.split("");

  g.forEach((digit, i) => {
    if (s.includes(digit)) correct++;
    if (digit === s[i]) wellPlaced++;
  });

  return `${correct} chiffres corrects, ${wellPlaced} bien placés`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
