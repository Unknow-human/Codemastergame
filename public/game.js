const socket = io();
const username = localStorage.getItem("username");
const token = localStorage.getItem("token");

if (!username || !token) {
  window.location.href = "/";
}

document.getElementById("welcome-msg").innerText = `Bienvenue, ${username} !`;

socket.emit("identify", username);

let isSolo = false;
let soloCode = "";
let currentRoom = "";

function startSolo() {
  isSolo = true;
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("game-section").style.display = "block";
  document.getElementById("chat-section").style.display = "none";
  soloCode = generateCode();
  console.log("Code secret solo :", soloCode);
}

function generateCode() {
  let code = "";
  while (code.length < 4) {
    const digit = Math.floor(Math.random() * 10).toString();
    code += digit;
  }
  return code;
}

function loadUsers() {
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("duel-section").style.display = "block";
  document.getElementById("chat-section").style.display = "block";
}

socket.on("userList", (users) => {
  const list = document.getElementById("user-list");
  list.innerHTML = "";
  users.forEach((user) => {
    if (user !== username) {
      const li = document.createElement("li");
      li.innerHTML = `${user} <button onclick="invite('${user}')">Inviter</button>`;
      list.appendChild(li);
    }
  });
});

function invite(user) {
  const code = document.getElementById("secret-code").value;
  if (code.length !== 4 || !/^\d{4}$/.test(code)) return alert("Code invalide");

  socket.emit("duelRequest", { from: username, to: user });
  alert(`Invitation envoyée à ${user}`);
}

socket.on("duelRequestReceived", ({ from }) => {
  if (confirm(`${from} veut jouer avec toi. Accepter ?`)) {
    const code = prompt("Entre ton code secret (4 chiffres)");
    if (!/^\d{4}$/.test(code)) return alert("Code invalide");

    socket.emit("duelResponse", { from: username, to: from, accepted: true });
    socket.emit("startDuelGame", { opponent: from, code });
  } else {
    socket.emit("duelResponse", { from: username, to: from, accepted: false });
  }
});

socket.on("duelResponseReceived", ({ from, accepted }) => {
  if (accepted) {
    const code = document.getElementById("secret-code").value;
    socket.emit("startDuelGame", { opponent: from, code });
  } else {
    alert(`${from} a refusé le duel.`);
  }
});

socket.on("duelStarted", ({ roomId }) => {
  currentRoom = roomId;
  document.getElementById("duel-section").style.display = "none";
  document.getElementById("game-section").style.display = "block";
  document.getElementById("chat-section").style.display = "block";
  document.getElementById("history").innerHTML = "";
});

function submitGuess() {
  const guess = document.getElementById("guess").value;
  if (!/^\d{4}$/.test(guess)) return alert("Devinez un code à 4 chiffres");

  if (isSolo) {
    const result = checkGuess(soloCode, guess);
    displayGuess(guess, result);
    if (guess === soloCode) {
      alert("Bravo ! Tu as trouvé le code !");
      document.getElementById("game-section").style.display = "none";
    }
  } else {
    socket.emit("submitGuess", { roomId: currentRoom, guess });
  }

  document.getElementById("guess").value = "";
}

socket.on("guessResult", ({ guess, result }) => {
  displayGuess(guess, result);
});

socket.on("duelEnded", ({ winner, abandon, code }) => {
  if (abandon) {
    alert(`${winner === socket.id ? "Tu as gagné !" : "Ton adversaire a gagné."} (abandon)`);
  } else {
    alert(`${winner === socket.id ? "Tu as gagné !" : "Ton adversaire a trouvé le code : " + code}`);
  }
  document.getElementById("game-section").style.display = "none";
});

function displayGuess(guess, result) {
  const li = document.createElement("li");
  li.innerText = `${guess} → ${result}`;
  document.getElementById("history").appendChild(li);
}

function checkGuess(secret, guess) {
  let correct = 0, wellPlaced = 0;
  const s = secret.split("");
  const g = guess.split("");

  g.forEach((digit, i) => {
    if (s.includes(digit)) correct++;
    if (digit === s[i]) wellPlaced++;
  });

  return `${correct} chiffres corrects, ${wellPlaced} bien placés`;
}

function abandonGame() {
  if (!isSolo && currentRoom) {
    socket.emit("abandon", { roomId: currentRoom });
  }
  alert("Tu as abandonné.");
  document.getElementById("game-section").style.display = "none";
}

// Chat
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (message) {
    socket.emit("chatMessage", { username, message });
    input.value = "";
  }
}

socket.on("chatMessage", ({ username: from, message }) => {
  const li = document.createElement("li");
  li.textContent = `${from}: ${message}`;
  document.getElementById("chat-messages").appendChild(li);
});
