---
name: xlsx
description: Use this skill whenever a spreadsheet is the primary input or output, including creating, reading, editing, cleaning, formatting, calculating, or converting spreadsheet data.
license: Proprietary; see the source repository's license terms.
metadata:
  source: anthropics/skills
  source_path: skills/xlsx/SKILL.md
---

# Spreadsheet Skill

Use this skill for spreadsheet-centered tasks involving .xlsx, .xlsm, .csv, or .tsv files.

## Workflow

1. Identify the workbook or tabular input and the intended deliverable.
2. Preserve existing workbook structure and formatting when editing an existing file.
3. Use a spreadsheet-aware library for workbook manipulation and a dataframe library for data analysis when appropriate.
4. Keep formulas valid and avoid introducing broken references.
5. Recalculate formula results when the environment supports it, then inspect the workbook for formula errors.
6. Verify that the output file opens successfully and contains the requested sheets/data.

## Output requirements

For a spreadsheet deliverable, state the output path and summarize the meaningful changes. Do not claim formulas or formatting were verified unless they were actually checked.

## Source

This skill is an independent, compact implementation inspired by the XLSX skill published in Anthropic's public Agent Skills repository. It is not a verbatim copy.
