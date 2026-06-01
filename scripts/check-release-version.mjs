import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const expectedTag = `v${packageJson.version}`;
const actualTag = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME || "";

if (!actualTag) {
  console.error("Missing RELEASE_TAG or GITHUB_REF_NAME.");
  process.exit(1);
}

if (actualTag !== expectedTag) {
  console.error(`Release tag mismatch. package.json expects ${expectedTag}, got ${actualTag}.`);
  process.exit(1);
}

console.log(`Release version ok: ${actualTag}`);
