import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const MAX_COMPATIBILITY = 500;

function splitSkillFile(raw, filePath) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`Missing YAML frontmatter in ${filePath}`);
  return { frontmatter: parse(match[1]), body: match[2] };
}

function validateSkill(frontmatter, directoryName, filePath) {
  if (!frontmatter || typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
    throw new Error(`Invalid YAML frontmatter in ${filePath}`);
  }

  const { name, description, license, compatibility, metadata, "allowed-tools": allowedTools } = frontmatter;

  if (
    typeof name !== "string" ||
    name.length < 1 ||
    name.length > MAX_NAME ||
    !NAME_RE.test(name) ||
    name.includes("--")
  ) {
    throw new Error(`Invalid skill name in ${filePath}`);
  }
  if (name !== directoryName) {
    throw new Error(`Skill name "${name}" must match directory "${directoryName}"`);
  }
  if (typeof description !== "string" || description.length < 1 || description.length > MAX_DESCRIPTION) {
    throw new Error(`Invalid skill description in ${filePath}`);
  }
  if (license !== undefined && typeof license !== "string") {
    throw new Error(`Invalid license in ${filePath}`);
  }
  if (
    compatibility !== undefined &&
    (typeof compatibility !== "string" || compatibility.length < 1 || compatibility.length > MAX_COMPATIBILITY)
  ) {
    throw new Error(`Invalid compatibility in ${filePath}`);
  }
  if (metadata !== undefined) {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error(`Invalid metadata in ${filePath}`);
    }
    for (const value of Object.values(metadata)) {
      if (typeof value !== "string") throw new Error(`Invalid metadata in ${filePath}`);
    }
  }
  if (allowedTools !== undefined && typeof allowedTools !== "string") {
    throw new Error(`Invalid allowed-tools in ${filePath}`);
  }
}

async function walkSkillFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });

  const files = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillPath = path.join(root, entry.name, "SKILL.md");
    try {
      await fs.access(skillPath);
      files.push(skillPath);
    } catch {
      // A direct child without an exact SKILL.md is not a skill.
    }
  }
  return files;
}

export async function loadSkills(root = path.resolve(".skills")) {
  const files = await walkSkillFiles(root);
  const skills = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, "utf8");
    const { frontmatter } = splitSkillFile(raw, filePath);
    const directoryName = path.basename(path.dirname(filePath));
    validateSkill(frontmatter, directoryName, filePath);

    skills.push({
      name: frontmatter.name,
      description: frontmatter.description,
      metadata: frontmatter,
      directory: path.dirname(filePath),
      filePath,
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadSkillBody(skill) {
  const raw = await fs.readFile(skill.filePath, "utf8");
  const { body } = splitSkillFile(raw, skill.filePath);
  return body;
}

export function skillCatalog(skills) {
  return skills.map(({ name, description }) => ({ name, description }));
}
