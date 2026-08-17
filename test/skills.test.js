import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadSkillBody, loadSkills, skillCatalog } from "../src/skills.js";

test("discovers exactly three valid skills and exposes metadata only in the catalog", async () => {
  const skills = await loadSkills(path.resolve(".skills"));

  assert.deepEqual(skills.map((skill) => skill.name), ["pdf", "welcome-me", "xlsx"]);
  assert.equal(skills.length, 3);

  const catalog = skillCatalog(skills);
  assert.deepEqual(Object.keys(catalog[0]).sort(), ["description", "name"]);
  assert.ok(catalog.every((skill) => !Object.hasOwn(skill, "body")));
  assert.ok(skills.every((skill) => !Object.hasOwn(skill, "body")));
});

test("loads a skill body only when explicitly activated", async () => {
  const skills = await loadSkills(path.resolve(".skills"));
  const welcome = skills.find((skill) => skill.name === "welcome-me");

  assert.ok(welcome);
  assert.equal(Object.hasOwn(welcome, "body"), false);

  const body = await loadSkillBody(welcome);
  assert.match(body, /^\n# Welcome Me Skill/);
  assert.match(body, /> Welcome to our mini-agent assignment!/);
});

test("rejects a skill whose directory name does not match its frontmatter name", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "mini-agent-skills-"));
  const badDir = path.join(root, "wrong-name");
  await fs.mkdir(badDir, { recursive: true });
  await fs.writeFile(
    path.join(badDir, "SKILL.md"),
    "---\nname: right-name\ndescription: Test skill\n---\n\n# Test\n",
    "utf8"
  );

  await assert.rejects(
    () => loadSkills(root),
    /must match directory/
  );

  await fs.rm(root, { recursive: true, force: true });
});
