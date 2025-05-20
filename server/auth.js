const users = [];

const registerUser = (username, password) => {
  if (users.some((user) => user.username === username)) {
    return { success: false, message: "Nom d'utilisateur déjà pris." };
  }
  users.push({ username, password });
  return { success: true, message: "Inscription réussie !" };
};

const authenticateUser = (username, password) => {
  const user = users.find((user) => user.username === username && user.password === password);
  if (user) {
    return { success: true, message: "Connexion réussie !" };
  }
  return { success: false, message: "Nom d'utilisateur ou mot de passe incorrect." };
};

module.exports = { registerUser, authenticateUser };
