const { generateCode, evaluateGuess } = require("../server/gameLogic");

test("Génération de code à 4 chiffres", () => {
  const code = generateCode();
  expect(code).toMatch(/^\d{4}$/);
});

test("Évaluation d'une tentative correcte", () => {
  const feedback = evaluateGuess("1234", "1432");
  expect(feedback).toContain("4 chiffres corrects");
});

test("Évaluation d'une tentative partiellement correcte", () => {
  const feedback = evaluateGuess("5678", "5690");
  expect(feedback).toContain("2 chiffres corrects");
});
