const { registerUser, authenticateUser } = require("../server/auth");

test("Inscription d'un nouvel utilisateur", () => {
  const result = registerUser("Fabio", "securepassword");
  expect(result.success).toBe(true);
});

test("Tentative d'inscription avec un nom déjà pris", () => {
  registerUser("Fabio", "securepassword");
  const result = registerUser("Fabio", "newpassword");
  expect(result.success).toBe(false);
});

test("Authentification réussie", () => {
  registerUser("Fabio", "securepassword");
  const result = authenticateUser("Fabio", "securepassword");
  expect(result.success).toBe(true);
});

test("Authentification échouée avec mauvais mot de passe", () => {
  registerUser("Fabio", "securepassword");
  const result = authenticateUser("Fabio", "wrongpassword");
  expect(result.success).toBe(false);
});
