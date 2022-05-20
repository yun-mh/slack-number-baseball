const { DIGIT_NUMBER } = require("./constants");

function generateQuizNumber() {
  let result = "";
  let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = 0; i < DIGIT_NUMBER; i++) {
    pickedNum = numbers[Math.floor(Math.random() * numbers.length)];
    numbers = numbers.filter((number) => number !== pickedNum);
    result += pickedNum.toString();
  }
  return result;
}

function IsDuplicateNumbers(inputNumbers) {
  const numToSet = new Set(inputNumbers);
  if (numToSet.size !== DIGIT_NUMBER) {
    return true;
  }
  return false;
}

module.exports = { generateQuizNumber, IsDuplicateNumbers };
