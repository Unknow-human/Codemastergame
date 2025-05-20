import React, { useState } from "react";

const TournamentPage = () => {
  const [players, setPlayers] = useState(["Joueur 1", "Joueur 2", "Joueur 3", "Joueur 4"]);
  const [round, setRound] = useState(1);

  const nextRound = () => {
    setRound((prevRound) => prevRound + 1);
  };

  return (
    <div className="tournament-container">
      <h1>Mode Tournoi - CodeMaster Duel</h1>
      <p>Phase actuelle : Round {round}</p>

      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>

      <button onClick={nextRound}>Passer au round suivant</button>
    </div>
  );
};

export default TournamentPage;
