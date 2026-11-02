#!/usr/bin/env node
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const GUEST_LIST_URL = "https://github.com/rajdeep564/wandering-mochi/edit/main/docs/sites.json";

if (process.argv[2] !== "invite") {
  console.log("Usage: npx wandering-mochi invite");
  process.exit(process.argv[2] ? 1 : 0);
}

const folder = existsSync("public") ? "public" : ".";
writeFileSync(join(folder, "mochi.txt"), "welcome\n");

console.log(`Created ${join(folder, "mochi.txt")}. Your site now invites Mochi.`);
console.log("\nDeploy it, then add your domain to her guest list:");
console.log(GUEST_LIST_URL);
