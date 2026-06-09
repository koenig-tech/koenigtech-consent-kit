import { cp, mkdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const source = path.join(root, "wordpress-plugin/koenigtech-consent");
const output = path.join(root, "wordpress-plugin/build/koenigtech-consent-wordpress.zip");
const stagingRoot = path.join(os.tmpdir(), `koenigtech-consent-wordpress-${Date.now()}`);
const stagingPlugin = path.join(stagingRoot, "koenigtech-consent");

await mkdir(stagingPlugin, { recursive: true });
await cp(source, stagingPlugin, { recursive: true });
await rm(path.join(stagingPlugin, "build"), { recursive: true, force: true });
await mkdir(path.dirname(output), { recursive: true });

await execFileAsync("zip", ["-r", "-FS", output, "koenigtech-consent"], {
  cwd: stagingRoot
});

await rm(stagingRoot, { recursive: true, force: true });
console.log(output);
