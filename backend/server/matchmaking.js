const playersQueue = [];

const addPlayerToQueue = (player) => {
  playersQueue.push(player);
  checkForMatch();
};

const checkForMatch = () => {
  if (playersQueue.length >= 2) {
    const player1 = playersQueue.shift();
    const player2 = playersQueue.shift();
    
    startMatch(player1, player2);
  }
};

const startMatch = (player1, player2) => {
  console.log(`Match trouvé : ${player1.name} vs ${player2.name}`);
};

module.exports = { addPlayerToQueue };
