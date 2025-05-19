const socket = io();

// Formulaires
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Connexion
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      window.location.href = "/game.html";
    } else {
      alert(data.error || "Erreur de connexion.");
    }
  } catch (err) {
    alert("Une erreur est survenue.");
  }
});

// Inscription
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Inscription réussie. Connectez-vous.");
    } else {
      alert(data.error || "Erreur lors de l'inscription.");
    }
  } catch (err) {
    alert("Une erreur est survenue.");
  }
});
