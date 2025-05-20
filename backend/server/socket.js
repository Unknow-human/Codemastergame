const socketIo = require("socket.io");

const initializeSocket = (server) => {
  const io = socketIo(server);

  io.on("connection", (socket) => {
    console.log(`Utilisateur connecté : ${socket.id}`);

    socket.on("sendMessage", (message) => {
      io.emit("newMessage", message);
    });

    socket.on("joinMatchmaking", (player) => {
      console.log(`${player.name} a rejoint le matchmaking.`);
      io.emit("playerJoined", player);
    });

    socket.on("disconnect", () => {
      console.log(`Utilisateur déconnecté : ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };
