# mini-agent

A small Node.js CLI that implements the open Agent Skills format with Claude Sonnet.

## What it does

- Discovers direct child skill folders containing an exact `SKILL.md`.
- Parses and validates Agent Skills frontmatter.
- Sends only skill `name` and `description` to Claude initially.
- Lets Claude decide whether a skill is relevant through the `activate_skill` tool.
- Loads the full `SKILL.md` body only after activation (progressive disclosure).
- Supports `--debug` to show which skill bodies were actually activated.
- Includes three skills: `welcome-me`, `pdf`, and `xlsx`.

The `pdf` and `xlsx` skills are compact, independently written implementations inspired by the corresponding skills in Anthropic's public `anthropics/skills` repository; their source paths are recorded in their frontmatter. They are not verbatim copies.

## Setup

```bash
npm install
export ANTHROPIC_API_KEY="your-api-key"
```

Optional model override:

```bash
export ANTHROPIC_MODEL="claude-sonnet-4-6"
```

## Run

```bash
node src/cli.js "new to this project what should i do"
node src/cli.js --debug "what's the weather?"
```

`--debug` reports the skill bodies that were actually loaded, so an unrelated prompt should show `none` rather than merely listing discovered skills.

## Skill layout

```text
mini-agent/
├── .skills/
│   ├── welcome-me/
│   │   └── SKILL.md
│   ├── pdf/
│   │   └── SKILL.md
│   └── xlsx/
│       └── SKILL.md
├── src/
│   ├── agent.js
│   ├── cli.js
│   └── skills.js
├── package.json
└── README.md
```

## Assignment note

The supplied `welcome-me` file was included verbatim. Its hard requirement says the response must start with `> Welcome to our mini-agent assignment!`, which conflicts with the separate example requirement `> Welcome to our agent!`. The implementation follows the supplied SKILL.md requirement because the file itself was required to remain unchanged.
