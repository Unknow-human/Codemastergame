require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIO = require("socket.io");
const connectDB = require("./db");
const User = require("./models/User");

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ROUTES

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Utilisateur enregistré." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Utilisateur introuvable." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SOCKET.IO

let users = {};
let duels = {};

io.on("connection", (socket) => {
  console.log("Connexion :", socket.id);

  socket.on("identify", (username) => {
    users[username] = socket.id;
    io.emit("userList", Object.keys(users));
  });

  socket.on("duelRequest", ({ from, to }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("duelRequestReceived", { from });
    }
  });

  socket.on("duelResponse", ({ from, to, accepted }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("duelResponseReceived", { from, accepted });
    }
  });

  socket.on("startDuelGame", ({ opponent, code }) => {
    const roomId = [socket.id, users[opponent]].sort().join("-");
    socket.join(roomId);

    if (!duels[roomId]) {
      duels[roomId] = {
        players: [socket.id],
        codes: { [socket.id]: code },
        guesses: {}
      };
    } else {
      duels[roomId].players.push(socket.id);
      duels[roomId].codes[socket.id] = code;
    }

    if (Object.keys(duels[roomId].codes).length === 2) {
      io.to(roomId).emit("duelStarted", { roomId });
    }
  });

  socket.on("submitGuess", ({ roomId, guess }) => {
    const duel = duels[roomId];
    if (!duel) return;

    const opponentId = duel.players.find((p) => p !== socket.id);
    const opponentCode = duel.codes[opponentId];

    const result = checkGuess(opponentCode, guess);
    io.to(socket.id).emit("guessResult", { guess, result });

    if (guess === opponentCode) {
      io.to(roomId).emit("duelEnded", {
        winner: socket.id,
        code: opponentCode
      });
      delete duels[roomId];
    }
  });

  socket.on("abandon", ({ roomId }) => {
    const duel = duels[roomId];
    if (!duel) return;

    const opponentId = duel.players.find((p) => p !== socket.id);
    io.to(roomId).emit("duelEnded", {
      winner: opponentId,
      abandon: true
    });
    delete duels[roomId];
  });

  socket.on("chatMessage", ({ username, message }) => {
    io.emit("chatMessage", { username, message });
  });

  socket.on("disconnect", () => {
    for (const user in users) {
      if (users[user] === socket.id) delete users[user];
    }
    io.emit("userList", Object.keys(users));
    console.log("Déconnexion :", socket.id);
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
});

// LANCEMENT DU SERVEUR
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
