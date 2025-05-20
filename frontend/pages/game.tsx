import React, { useState } from "react";

const GamePage = () => {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleGuess = () => {
    // Simuler un retour de feedback intelligent
    setFeedback("2 chiffres corrects (dont 1 bien placé)");
  };

  return (
    <div className="game-container">
      <h1>CodeMaster Duel - Jeu Principal</h1>
      <p>Trouvez le code à 4 chiffres !</p>

      <input
        type="text"
        maxLength={4}
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Entrez votre code"
      />
      <button onClick={handleGuess}>Valider</button>

      <p>Feedback : {feedback}</p>
    </div>
  );
};

export default GamePage;
