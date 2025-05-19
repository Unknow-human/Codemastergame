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

// WebSocket pour duels, matchmaking, chat (sera complété ensuite)
io.on("connection", (socket) => {
  console.log("Un joueur est connecté : " + socket.id);

  socket.on("disconnect", () => {
    console.log("Un joueur s'est déconnecté : " + socket.id);
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
