const socket = io();

// Elements DOM
const authContainer = document.getElementById("auth-container");
const lobbyContainer = document.getElementById("lobby-container");
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const authError = document.getElementById("auth-error");
const usernameDisplay = document.getElementById("username-display");
const logoutBtn = document.getElementById("logout-btn");
const userListSection = document.getElementById("user-list-section");
const userList = document.getElementById("user-list");
const toggleThemeBtn = document.getElementById("toggle-theme");

let currentUser = null;
let token = null;

// Toggle thème clair/sombre
function loadTheme() {
  const theme = localStorage.getItem("theme") || "light";
  if (theme === "dark") {
    document.body.classList.add("dark");
    toggleThemeBtn.textContent = "Mode Clair";
  } else {
    document.body.classList.remove("dark");
    toggleThemeBtn.textContent = "Mode Sombre";
  }
}
toggleThemeBtn.addEventListener("click", () => {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
    toggleThemeBtn.textContent = "Mode Sombre";
  } else {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    toggleThemeBtn.textContent = "Mode Clair";
  }
});
loadTheme();

// Affiche lobby et initialise socket
function showLobby(username) {
  currentUser = username;
  usernameDisplay.textContent = username;
  authContainer.style.display = "none";
  lobbyContainer.style.display = "block";
  userListSection.style.display = "none";
  authError.textContent = "";

  // Informer serveur socket de l'identité
  socket.emit("identify", username);
}

// Affiche erreur
function showError(msg) {
  authError.textContent = msg;
}

// Inscription
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError("Merci de remplir email et mot de passe.");
    return;
  }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password, username: email.split("@")[0] })
    });
    const data = await res.json();
    if (!res.ok) {
      showError(data.error || "Erreur inscription.");
      return;
    }
    alert("Inscription réussie, veuillez vous connecter.");
  } catch (err) {
    showError("Erreur réseau.");
  }
});

// Connexion
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError("Merci de remplir email et mot de passe.");
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Erreur connexion.");
      return;
    }

    token = data.token;
    showLobby(data.username);
  } catch (err) {
    showError("Erreur réseau.");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  token = null;
  currentUser = null;
  authContainer.style.display = "block";
  lobbyContainer.style.display = "none";
  authError.textContent = "";
});

// Mise à jour liste utilisateurs en ligne
socket.on("userList", (users) => {
  userList.innerHTML = "";
  users.forEach(user => {
    if (user !== currentUser) {
      const li = document.createElement("li");
      li.textContent = user;
      userList.appendChild(li);
    }
  });
  if (users.length > 1) {
    userListSection.style.display = "block";
  } else {
    userListSection.style.display = "none";
  }
});
