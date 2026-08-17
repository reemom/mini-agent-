import Anthropic from "@anthropic-ai/sdk";
import { skillCatalog } from "./skills.js";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are mini-agent, a Node.js coding agent that implements the Agent Skills specification.

Skills are progressively disclosed. You are given only skill metadata (name and description) at the start. Do not assume or reproduce a skill's body from its metadata. When a skill is relevant to the user's request, call activate_skill with its exact name. The tool result contains the full SKILL.md instructions; follow those instructions for the remainder of the response.

Do not activate unrelated skills. In particular, do not activate a skill merely because a word happens to overlap with the user's request. Decide based on the task and the skill description.

When a skill is activated, treat its SKILL.md instructions as authoritative for that task, while continuing to follow system-level safety and tool constraints.`;

function makeTool(skills) {
  return {
    name: "activate_skill",
    description: "Load the full instructions for an available Agent Skill when it is relevant to the user's task.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          enum: skills.map((skill) => skill.name),
          description: "Exact name of the skill to activate.",
        },
      },
      required: ["name"],
      additionalProperties: false,
    },
  };
}

function debugOutput(loaded, byName) {
  console.error("[debug] skill bodies loaded:");

  if (!loaded.size) {
    console.error("(none)");
    return;
  }

  for (const name of loaded) {
    const skill = byName.get(name);
    console.error(`\n--- ${name} ---`);
    console.error(skill.body);
    console.error(`--- end ${name} ---`);
  }
}

export async function runAgent(prompt, skills, { debug = false, model = DEFAULT_MODEL } = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set. Set it before running mini-agent.");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const byName = new Map(skills.map((skill) => [skill.name, skill]));
  const loaded = new Set();
  const messages = [{ role: "user", content: prompt }];
  const catalog = JSON.stringify(skillCatalog(skills), null, 2);
  const system = `${SYSTEM_PROMPT}\n\nAvailable skills (metadata only):\n${catalog}`;

  for (let turn = 0; turn < 12; turn += 1) {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system,
      tools: [makeTool(skills)],
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      if (debug) debugOutput(loaded, byName);
      return text;
    }

    const toolResults = [];
    for (const block of response.content.filter((item) => item.type === "tool_use")) {
      if (block.name !== "activate_skill") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: `Unknown tool: ${block.name}`,
        });
        continue;
      }

      const skill = byName.get(block.input?.name);
      if (!skill) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: `Unknown skill: ${block.input?.name ?? "(missing name)"}`,
        });
        continue;
      }

      loaded.add(skill.name);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: `<skill_content name="${skill.name}">\n${skill.body}\n\nSkill directory: ${skill.directory}\n</skill_content>`,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Agent exceeded the maximum number of skill-activation turns.");
}
