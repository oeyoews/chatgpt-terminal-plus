import dotenv from "dotenv";
import { ChatGPTAPI } from "chatgpt";
import prompts from "prompts";
import chalk from "chalk";

dotenv.config();

async function Chat() {
  const api = new ChatGPTAPI({
    apiKey: process.env["OPENAI_API_KEY"] as string,
    debug: false,
    completionParams: {
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      top_p: 0.8,
    },
  });

  if (!api.apiKey) {
    console.log(chalk.red.bold("OpenAI API key not found"));
    return;
  }

  let exit = false;

  while (!exit) {
    const response = await prompts({
      type: "text",
      name: "userMessage",
      message: "Send your prompt",
    });

    const userMessage = response.userMessage || "exit";

    if (userMessage === "exit") {
      exit = true;
      // console.log("Goodbye!");
      break;
    }

    let res = await api.sendMessage(userMessage, {
      onProgress: (partialResponse) => {
        if (partialResponse.delta === "") {
          process.stdout.write("🎁 ");
        }
        if (partialResponse.delta) {
          process.stdout.write(chalk.green(partialResponse.delta));
        }
        /* if (partialResponse.delta === undefined) {
          console.log("\n");
        } */
      },
      timeoutMs: 2 * 60 * 1000,
      systemMessage: `Please use chinese to answer user questions with gfm markdown`,
    });

    console.log(
      `\n本次花费tokens ⤑ ` + chalk.cyan.bold(res.detail?.usage?.total_tokens)
    );
  }
}

Chat();