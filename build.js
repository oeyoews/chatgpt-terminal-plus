import { build } from "esbuild";

build({
  entryPoints: ["./index.js"], // 入口文件路径
  outfile: "dist/chatgpt.min.js", // 输出文件路径
  bundle: true, // 打包成一个文件
  minify: true, // 压缩代码
  sourcemap: false, // 生成源映射文件
  platform: "node", // Specify Node.js platform
}).catch((err) => {
  console.error(err);
  process.exit(1);
});