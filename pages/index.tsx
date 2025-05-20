import React from "react";

const HomePage = () => {
  return (
    <div className="home-container">
      <h1>Bienvenue sur CODEMASTER DUEL</h1>
      <p>Un jeu de déduction de code en temps réel.</p>
      <button onClick={() => window.location.href = "/game"}>
        Jouer Maintenant
      </button>
    </div>
  );
};

export default HomePage;
