const { MAX_TRIES } = require("./constants");

const START_PHRASE =
  "数字野球ゲームを始めます〜!\nこのスレッドに3桁の数字を返信して私が考えてる数字を当ててみましょう！";
const RULE_EXPLAIN_TITLE = ":books:ルール説明";
const DUPLICATION_WARNING_PHRASE = "入力した数字に重複があるので無効です。";
const FINISH_GAME_PHRASE = "ゲームを終了します。";
const RULE_PHRASE = `
数字野球はボットが出題する3桁の数字を当ててみるゲームです。\n
出題数字の各桁は \`0~9\` になり、各桁は違う数字になっています。
\n> \`012\` : OK  \`110\` : NG \n
3桁の数字をスレッドに返信すると、ボットは以下のようにヒントを返してくれます。
• \`ストライク\` ：各桁の数字と位置が両方一致する
• \`ボール\` ：数字は存在するが桁の位置が間違っている
• \`アウト\` ：入力した数字が出題数字には存在しない
\n
例えば、出題数字が \`980\` で、入力数字が \`082\` の場合
\n>1ストライク 1ボール\n
出題数字が \`980\` で、入力数字が \`123\` の場合は
\n>アウト！\n
になります。\n
最大トライ数は${MAX_TRIES}回で、${MAX_TRIES}回以内に正解を求められなかったらゲームオーバーになります。`;

function printTries(tries) {
  return `${tries}回目：`;
}
function generateSuccessPhrase(quizNumber) {
  return `正解です！答えは \`${quizNumber}\` でした。\nゲームを終了します。`;
}
function generateGameOverPhrase(quizNumber) {
  return `トライ数が${MAX_TRIES}になりました…　ゲームオーバーです！\n答えは \`${quizNumber}\` でした！`;
}
function generateHintPhrase(hint) {
  const { strikes, balls } = hint;
  if (strikes === 0 && balls === 0) {
    return "アウト！";
  }
  return `${strikes} ストライク, ${balls} ボール`;
}

module.exports = {
  START_PHRASE,
  RULE_EXPLAIN_TITLE,
  DUPLICATION_WARNING_PHRASE,
  FINISH_GAME_PHRASE,
  RULE_PHRASE,
  printTries,
  generateSuccessPhrase,
  generateHintPhrase,
  generateGameOverPhrase,
};
