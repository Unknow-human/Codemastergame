const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Serveur CodeMaster Duel en ligne !");
});

io.on("connection", (socket) => {
  console.log("Nouvelle connexion :", socket.id);

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté :", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
