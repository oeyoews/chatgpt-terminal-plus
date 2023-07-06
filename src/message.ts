// messaging.js
import chalk from "chalk";
import prompts from "prompts";
import { saveConversation, appendToConversation } from "./conversation.js";
import api from "./api.js";

let res: any = {};

export const sendMessage = async (userMessage: string) => {
  res = await api.sendMessage(userMessage, {
    parentMessageId: res?.id,
    onProgress: (partialResponse) => {
      if (partialResponse.delta === "") {
        // TODO
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
    const chatPrompt = await prompts({
      type: "text",
      name: "userMessage",
      message: "Send your prompt",
    });

    let userMessage = chatPrompt.userMessage?.trim();

    if (userMessage === "> new" || userMessage === "> exit") {
      const conversationSave = await prompts([
        {
          type: "confirm",
          name: "shouldSave",
          message: "是否保存对话？",
        },
        {
          type: (pre) => (pre == false ? null : "text"),
          name: "title",
          // TODO: support res.text
          message: "标题",
        },
      ]);
      conversationSave.title &&
        saveConversation(conversationSave.title?.trim().toLowerCase());

      if (userMessage === "> exit") break;

      if (userMessage === "> new") {
        // 开始新的对话, 重置id
        userMessage = "开始新的对话";
        res.id = null;
        console.log(chalk.cyan.bold("🟪 New conversation started"));
      }
    }

    await sendMessage(userMessage);
    // userMessage && (await sendMessage(userMessage));
  }
};
