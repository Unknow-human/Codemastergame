const users = {};

const registerUser = (username, password) => {
  if (users[username]) {
    return { success: false, message: "Nom d'utilisateur déjà pris." };
  }
  users[username] = { password };
  return { success: true, message: "Inscription réussie !" };
};

const authenticateUser = (username, password) => {
  if (users[username] && users[username].password === password) {
    return { success: true, message: "Connexion réussie !" };
  }
  return { success: false, message: "Identifiants incorrects." };
};

module.exports = { registerUser, authenticateUser };
