import fs from "fs";
import dotenv from "dotenv";
import { ChatGPTAPI } from "chatgpt";
import prompts from "prompts";
import chalk from "chalk";

dotenv.config();

const api = new ChatGPTAPI({
  apiKey: process.env["OPENAI_API_KEY"] as string,
  debug: false,
  completionParams: {
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    top_p: 0.8,
  },
});

async function chatgpt_terminal_plus() {
  if (!api.apiKey) {
    console.log(chalk.red.bold("OpenAI API key not found"));
    return;
  }

  let exit = false;
  let res: any;
  let conversation = ""; // 保存对话内容的变量

  const sendMessage = async (userMessage: string) => {
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

    const nowTime = new Date().toLocaleTimeString();
    console.log(
      `${nowTime} 本次花费tokens ⤑ ` +
        chalk.cyan.bold(res.detail?.usage?.total_tokens, "\n")
    );

    const botReply = `> 🤖 **Bot**: \n${res.text}\n\n`;
    conversation += `[${nowTime}]\n\n> 📝 **User**: ${userMessage}\n\n${botReply}`; // 将每个用户消息和机器人回复追加到对话变量中
  };

  while (!exit) {
    let response = await prompts({
      type: "text",
      name: "userMessage",
      message: "Send your prompt",
      // TODO support ctrl D
      onState: (state) => {
        if (state.aborted) {
          exit = true;
        }
      },
    });

    const userMessage = response.userMessage?.trim().toLowerCase() || "> exit";

    if (userMessage === "> exit") {
      exit = true;
      break;
    }

    if (userMessage === "> new") {
      // 如果开始了新的对话，生成一个新的文件
      if (conversation !== "") {
        const filename = `conversation_${Date.now().toString()}.md`;
        fs.writeFileSync(filename, conversation); // 将对话保存到Markdown文件
        console.log(chalk.green(`Conversation saved to "${filename}"`));
      }
      conversation = ""; // 重置对话变量
    }

    await sendMessage(userMessage);
  }

  // 在最后结束对话前保存对话内容到文件
  if (conversation !== "") {
    const filename = `conversation_${Date.now().toString()}.md`;
    fs.writeFileSync(filename, conversation); // 将对话保存到Markdown文件
    console.log(chalk.green(`Conversation saved to "${filename}"`));
  }
}

chatgpt_terminal_plus();