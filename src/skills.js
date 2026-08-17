import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_DESCRIPTION = 1024;

function validateSkill(skill, directoryName, filePath) {
  if (!skill || typeof skill !== "object") {
    throw new Error(`Invalid YAML frontmatter in ${filePath}`);
  }
  const { name, description } = skill;
  if (typeof name !== "string" || !NAME_RE.test(name) || name.length > 64) {
    throw new Error(`Invalid skill name in ${filePath}`);
  }
  if (name !== directoryName) {
    throw new Error(`Skill name "${name}" must match directory "${directoryName}"`);
  }
  if (typeof description !== "string" || description.length < 1 || description.length > MAX_DESCRIPTION) {
    throw new Error(`Invalid skill description in ${filePath}`);
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
      // Direct child without an exact SKILL.md is not a skill.
    }
  }
  return files;
}

export async function loadSkills(root = path.resolve(".skills")) {
  const files = await walkSkillFiles(root);
  const skills = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, "utf8");
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) throw new Error(`Missing YAML frontmatter in ${filePath}`);

    const frontmatter = parse(match[1]);
    const body = match[2].trimEnd();
    const directoryName = path.basename(path.dirname(filePath));
    validateSkill(frontmatter, directoryName, filePath);

    skills.push({
      name: frontmatter.name,
      description: frontmatter.description,
      metadata: frontmatter,
      body,
      directory: path.dirname(filePath),
      filePath,
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function skillCatalog(skills) {
  return skills.map(({ name, description }) => ({ name, description }));
}
