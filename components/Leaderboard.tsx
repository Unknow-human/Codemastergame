import React from "react";

const Leaderboard = () => {
  const players = [
    { name: "Fabio", score: 1500 },
    { name: "Joueur 2", score: 1400 },
    { name: "Joueur 3", score: 1350 },
    { name: "Joueur 4", score: 1300 },
  ];

  return (
    <div className="leaderboard-container">
      <h2>Classement Global</h2>
      <table>
        <thead>
          <tr>
            <th>Rang</th>
            <th>Nom</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
