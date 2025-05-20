const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const evaluateGuess = (guess, secretCode) => {
  let correctDigits = 0;
  let wellPlaced = 0;

  for (let i = 0; i < 4; i++) {
    if (secretCode.includes(guess[i])) {
      correctDigits++;
      if (secretCode[i] === guess[i]) {
        wellPlaced++;
      }
    }
  }

  return `Feedback: ${correctDigits} chiffres corrects (${wellPlaced} bien placé)`;
};

module.exports = { generateCode, evaluateGuess };
