import { readFile, writeFile } from "node:fs/promises";

const files = [
  {
    input: new URL("../dist/koenig-consent.css", import.meta.url),
    output: new URL("../dist/koenig-consent.min.css", import.meta.url),
    minify: minifyCss
  },
  {
    input: new URL("../dist/koenig-consent.js", import.meta.url),
    output: new URL("../dist/koenig-consent.min.js", import.meta.url),
    minify: minifyJs
  }
];

for (const file of files) {
  const source = await readFile(file.input, "utf8");
  await writeFile(file.output, file.minify(source), "utf8");
  console.log(`Built ${file.output.pathname}`);
}

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim() + "\n";
}

function minifyJs(source) {
  return source
    .replace(/\/\*![\s\S]*?\*\//g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n") + "\n";
}
