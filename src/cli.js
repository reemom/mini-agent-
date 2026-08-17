#!/usr/bin/env node

import path from "node:path";
import { loadSkills } from "./skills.js";
import { runAgent } from "./agent.js";

function usage() {
  console.log(`Usage:\n  mini-agent [--debug] <prompt>\n\nOptions:\n  --debug    Print which skill bodies were actually loaded\n\nEnvironment:\n  ANTHROPIC_API_KEY   Required Claude API key\n  ANTHROPIC_MODEL     Optional model override (default: claude-sonnet-4-6)`);
}

function parseArgs(argv) {
  let debug = false;
  const promptParts = [];
  for (const arg of argv) {
    if (arg === "--debug") debug = true;
    else if (arg === "--help" || arg === "-h") return { help: true };
    else promptParts.push(arg);
  }
  return { debug, prompt: promptParts.join(" ").trim() };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (!args.prompt) {
    usage();
    process.exitCode = 2;
    return;
  }

  const skillsRoot = path.resolve(process.env.AGENT_SKILLS_DIR || ".skills");
  const skills = await loadSkills(skillsRoot);
  if (!skills.length) throw new Error(`No valid skills found under ${skillsRoot}`);

  const answer = await runAgent(args.prompt, skills, { debug: args.debug });
  process.stdout.write(`${answer}\n`);
}

main().catch((error) => {
  console.error(`mini-agent: ${error.message}`);
  process.exitCode = 1;
});
