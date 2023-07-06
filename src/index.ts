import dotenv from "dotenv";
import chalk from "chalk";
import { startMessaging } from "./message.js";
import { saveConversation } from "./conversation.js";

dotenv.config();

if (!process.env["OPENAI_API_KEY"]) {
  console.log(chalk.red.bold("OpenAI API key not found"));
} else {
  startMessaging();
}

// Save conversation before exiting
process.on("SIGINT", () => {
  saveConversation("Last-Chat-Conversation");
  process.exit();
});
