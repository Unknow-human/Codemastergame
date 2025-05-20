const io = require("socket.io")(3001, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Utilisateur connecté : ${socket.id}`);

  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message);
  });

  socket.on("matchRequest", () => {
    console.log(`Matchmaking demandé par ${socket.id}`);
    // Logique de matchmaking ici
  });

  socket.on("disconnect", () => {
    console.log(`Utilisateur déconnecté : ${socket.id}`);
  });
});

module.exports = io;
