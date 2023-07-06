// messaging.js
import chalk from "chalk";
import prompts from "prompts";
import { saveConversation, appendToConversation } from "./conversation.js";
import api from "./api.js";

let res: any;

export const sendMessage = async (userMessage: string) => {
  res = await api.sendMessage(userMessage, {
    parentMessageId: (userMessage !== "> new" && res?.id) || null,
    onProgress: (partialResponse) => {
      if (partialResponse.delta === "") {
        userMessage === "new" &&
          console.log(chalk.cyan.bold("🟪 New conversation started"));
        process.stdout.write("\n🍉 ");
      }
      if (partialResponse.delta) {
        process.stdout.write(chalk.green(partialResponse.delta));
      }
      if (partialResponse.delta === undefined) {
        console.log("\n");
      }
    },
    timeoutMs: 2 * 60 * 1000,
    systemMessage:
      "Please use Chinese to answer user questions with GFM markdown",
  });

  const nowTime = new Date().toLocaleString();

  console.log(
    `${nowTime} 本次花费tokens ⤑ ` +
      chalk.cyan.bold(res.detail?.usage?.total_tokens, "\n")
  );

  const botReply = `> 🤖 **Bot**: \n${res.text}\n\n`;
  appendToConversation(userMessage, botReply);
};

export const startMessaging = async () => {
  let exit = false;

  while (!exit) {
    let response = await prompts({
      type: "text",
      name: "userMessage",
      message: "Send your prompt",
    });

    const userMessage = response.userMessage?.trim().toLowerCase() || "> exit";

    if (userMessage === "> exit") {
      exit = true;
      break;
    }

    if (userMessage === "> new") {
      const response = await prompts({
        type: "confirm",
        name: "shouldSave",
        message: "是否保存对话？",
      });

      if (response.shouldSave) {
        let conversationTitle = await prompts({
          type: "text",
          name: "title",
          message: "起一个标题",
        });

        saveConversation(conversationTitle.title.trim().toLowerCase());
      }
    }

    await sendMessage(userMessage);
  }

  saveConversation("Last-Chat-Conversation");
};
