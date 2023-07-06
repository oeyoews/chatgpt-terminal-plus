// conversation.js
import fs from "fs";
import path from "path";
import chalk from "chalk";

let conversation = "";

export const saveConversation = (mdTitle: string) => {
  if (conversation !== "") {
    const directory = path.join("./", "conversations");
    fs.mkdirSync(directory, { recursive: true });
    let filename = path.join(directory, `${mdTitle}.md`);

    if (fs.existsSync(filename)) {
      const timestamp = new Date().getTime();
      filename = `${mdTitle}_${timestamp}.md`;
    }

    fs.writeFile(filename, `# ${mdTitle}\n\n${conversation}`, (err) => {
      if (err) throw err;
    });
    console.log(chalk.green(`Conversation saved to "${filename}"`));
  }
  conversation = "";
};

export const appendToConversation = (userMessage: string, botReply: string) => {
  conversation += `> 📝 **User**: ${userMessage}\n\n${botReply}`;
};
