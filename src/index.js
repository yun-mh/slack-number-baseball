const { App } = require("@slack/bolt");
const dotenv = require("dotenv");
dotenv.config();

const { generateQuizNumber, IsDuplicateNumbers } = require("./utils");
const { DIGIT_NUMBER, MAX_TRIES } = require("./constants");
const {
  START_PHRASE,
  RULE_EXPLAIN_TITLE,
  DUPLICATION_WARNING_PHRASE,
  FINISH_GAME_PHRASE,
  RULE_PHRASE,
  generateSuccessPhrase,
  generateHintPhrase,
  generateGameOverPhrase,
  printTries,
} = require("./phrases");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: "debug",
  port: 3000,
});

let users = [];

app.message(/数字野球開始/, async ({ message, client }) => {
  // ゲームはスレッド内では開始不可
  if (!message.thread_ts) {
    // すでに進行中のゲームがあれば無効化する
    users = users.filter((user) => user.user !== message.user);

    users.push({
      user: message.user,
      thread_ts: message.ts,
      quizNumber: generateQuizNumber(),
      try: 0,
    });

    await client.chat.postMessage({
      channel: message.channel,
      blocks: [
        {
          type: "section",
          text: { type: "plain_text", text: START_PHRASE },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: RULE_EXPLAIN_TITLE,
              },
              action_id: "rule_button",
            },
          ],
        },
      ],
      thread_ts: message.ts,
    });
  }
});

app.message(/^\d{3}$/, async ({ message, client }) => {
  const currentPlayingUser = users.find((user) => user.user === message.user);

  // 現在ゲームプレイ中ではないまたはプレイ中であっても違うスレッドでプレイするんだったら反応しない
  if (
    !currentPlayingUser ||
    currentPlayingUser.thread_ts !== message.thread_ts
  ) {
    return;
  }

  const userInputNumbers = message.text;

  // 桁間で重複の数字が入力された場合、警告を出す
  if (IsDuplicateNumbers(userInputNumbers)) {
    await client.chat.postMessage({
      channel: message.channel,
      text: DUPLICATION_WARNING_PHRASE,
      thread_ts: currentPlayingUser.thread_ts,
    });
    return;
  }

  // ユーザのトライ回数を1増やす
  currentPlayingUser.try += 1;

  // 入力数字と出題数字が同じ場合の処理
  if (userInputNumbers === currentPlayingUser.quizNumber) {
    await client.chat.postMessage({
      channel: message.channel,
      text:
        printTries(currentPlayingUser.try) +
        generateSuccessPhrase(currentPlayingUser.quizNumber),
      thread_ts: currentPlayingUser.thread_ts,
    });

    //　ユーザを削除してゲームを終了する
    users = users.filter((user) => user.user !== currentPlayingUser.user);
  } else {
    let hint = {
      strikes: 0,
      balls: 0,
    };

    // ストライク・ボールの判定
    for (let i = 0; i < DIGIT_NUMBER; i++) {
      if (userInputNumbers[i] === currentPlayingUser.quizNumber[i]) {
        hint.strikes += 1;
      } else if (currentPlayingUser.quizNumber.includes(userInputNumbers[i])) {
        hint.balls += 1;
      }
    }

    await client.chat.postMessage({
      channel: message.channel,
      text: printTries(currentPlayingUser.try) + generateHintPhrase(hint),
      thread_ts: currentPlayingUser.thread_ts,
    });

    // ユーザのトライ回数が最大トライ数以上の場合、ゲームオーバにする
    if (currentPlayingUser.try >= MAX_TRIES) {
      await client.chat.postMessage({
        channel: message.channel,
        text: generateGameOverPhrase(currentPlayingUser.quizNumber),
        thread_ts: currentPlayingUser.thread_ts,
      });

      users = users.filter((user) => user.user !== currentPlayingUser.user);
    }
  }
});

app.message(/数字野球終了/, async ({ message, client }) => {
  const userToStopAndDelete = users.find((user) => user.user === message.user);

  if (!userToStopAndDelete) {
    return;
  }

  await client.chat.postMessage({
    channel: message.channel,
    text: FINISH_GAME_PHRASE,
    thread_ts: userToStopAndDelete.thread_ts,
  });

  users = users.filter((user) => user.user !== userToStopAndDelete.user);
});

app.action("rule_button", async ({ ack, client, body: { trigger_id } }) => {
  await ack();

  await client.views.open({
    trigger_id: trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: RULE_EXPLAIN_TITLE,
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: RULE_PHRASE,
          },
        },
      ],
    },
  });
});

app.start();
