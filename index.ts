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

async function Chat() {
  if (!api.apiKey) {
    console.log(chalk.red.bold("OpenAI API key not found"));
    return;
  }

  let exit = false;

  let response = await prompts({
    type: "text",
    name: "userMessage",
    message: "Send your prompt",
  });

  let userMessage = response.userMessage || "exit";

  let res = await api.sendMessage(userMessage, {
    onProgress: (partialResponse) => {
      if (partialResponse.delta === "") {
        process.stdout.write("\n🎁 ");
      }
      if (partialResponse.delta) {
        process.stdout.write(chalk.green(partialResponse.delta));
      }
      if (partialResponse.delta === undefined) {
        console.log("\n");
      }
    },
    timeoutMs: 2 * 60 * 1000,
    systemMessage: `Please use chinese to answer user questions with gfm markdown`,
  });

  while (!exit) {
    if (userMessage === "exit") {
      exit = true;
      break;
    }

    response = await prompts({
      type: "text",
      name: "userMessage",
      message: "Send your prompt",
    });

    userMessage = response.userMessage || "exit";

    res = await api.sendMessage(userMessage, {
      parentMessageId: res.id,
      onProgress: (partialResponse) => {
        if (partialResponse.delta === "") {
          process.stdout.write("\n🎁 ");
        }
        if (partialResponse.delta) {
          process.stdout.write(chalk.green(partialResponse.delta));
        }
        if (partialResponse.delta === undefined) {
          console.log("\n");
        }
      },
      timeoutMs: 2 * 60 * 1000,
      systemMessage: `Please use chinese to answer user questions with gfm markdown`,
    });

    const nowTime = new Date().toLocaleTimeString();
    console.log(
      `${nowTime} 本次花费tokens ⤑ ` +
        chalk.cyan.bold(res.detail?.usage?.total_tokens, "\n")
    );
  }
}

Chat();