---
name: pdf
description: Use this skill when the user wants to create, inspect, extract from, merge, split, transform, or otherwise work with PDF documents.
license: Proprietary; see the source repository's license terms.
metadata:
  source: anthropics/skills
  source_path: skills/pdf/SKILL.md
---

# PDF Skill

Use this skill for PDF-focused tasks. Prefer a dedicated PDF library or command-line PDF utility when the task requires deterministic document operations.

## Workflow

1. Identify the requested PDF operation and the input/output files.
2. Inspect the PDF before making destructive changes.
3. Use an appropriate PDF library/tool for the operation.
4. Preserve page order, text, metadata, and layout unless the user asks for changes.
5. Verify the resulting PDF can be opened and that the requested operation succeeded.

## Common operations

- Extract text or tables from existing PDFs.
- Merge multiple PDFs while preserving their order.
- Split PDFs into selected pages or page ranges.
- Rotate pages or apply other page-level transformations.
- Create PDFs with a document-generation library.
- Extract images when the task requires them.

## Output requirements

Explain what was done briefly and identify the resulting file when one is produced. Never claim a PDF operation succeeded without checking the result.

## Source

This skill is an independent, compact implementation inspired by the PDF skill published in Anthropic's public Agent Skills repository. It is not a verbatim copy.
