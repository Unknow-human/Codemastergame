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
  cors: {
    origin: "*"
  }
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSocket pour duels, matchmaking, chat (sera complété ensuite)
let users ={};

const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

// Liste des utilisateurs connectés
let users = {};

io.on("connection", (socket) => {
  console.log("Un utilisateur connecté :", socket.id);

  // Lorsqu'un joueur s'identifie
  socket.on("identify", (username) => {
    users[username] = socket.id;
    io.emit("userList", Object.keys(users)); // mettre à jour la liste
  });

  // Envoyer une invitation de duel
  socket.on("duelRequest", ({ from, to }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("duelRequestReceived", { from });
    }
  });

  // Répondre à l'invitation
  socket.on("duelResponse", ({ from, to, accepted }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("duelResponseReceived", { from, accepted });
    }
  });

  socket.on("disconnect", () => {
    for (const user in users) {
      if (users[user] === socket.id) delete users[user];
    }
    io.emit("userList", Object.keys(users));
    console.log("Utilisateur déconnecté :", socket.id);
  });
});


// Lancer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
