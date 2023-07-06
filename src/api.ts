// api.js
import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";

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

export default api;