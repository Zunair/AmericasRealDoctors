---
description: "Workspace instructions for future Copilot work in America's Real Doctors."
---

# Copilot Instructions

Before making changes in this repository, review these files first:

1. `docs/todo/TODO.Phase1.md`
2. `docs/architecture/content-model.md`
3. `docs/architecture/project-index.md`
4. `docs/architecture/architecture-decisions.md`
5. `docs/architecture/scalability-and-security.md`
6. `package.json`

Use the project index to locate the owning module and the architecture decisions to understand durable project constraints. Read only the files needed for the requested change rather than scanning the entire repository.

## Working Rules

- Keep the canonical content model in one place and generate repeated outputs from it.
- Do not duplicate page copy, directory data, or discovery text across unrelated files.
- Treat HTML pages as the primary public surface and JSON-LD, sitemap, and `llms.txt` as generated discovery outputs.
- Keep hand-authored files small and single-purpose so contributors and Copilot can load only the context relevant to a change; split files once they start mixing unrelated concerns.
- Keep generated files in sync with their source registry or generator.
- Keep the project index and architecture decisions concise and current when ownership boundaries or long-lived architecture decisions change.
- Update the TODO and architecture docs when introducing new long-lived rules or content pipeline changes.
- Prefer object-oriented structure where it improves clarity and reuse, especially for services, controllers, and stateful behavior.
- Keep browser controllers and security services consistent in style and responsibility; avoid one-off patterns that only appear in a single file.
- Use consistent formatting in every hand-authored file: 2-space indentation, no tabs, no trailing whitespace, and minimal incidental style variation.
- If a module starts mixing DOM wiring, business logic, and content rendering, split those responsibilities into separate modules or classes.

## Preferred Change Flow

- Start from the canonical content registry or the nearest owning module.
- Add or update generators before copying content into multiple files.
- Re-run the repository checks after any change that affects shared content, discovery files, or validation scripts.
- When introducing new JavaScript, check whether an existing class or service pattern already exists and follow it instead of inventing a new one.
- When asked to commit or push changes, include a concise bullet-point summary of the changes and validation results in the handoff; reuse those details in the pull request description when applicable.
- Write change-summary bullets consistently in simple present tense, beginning with verbs such as `Adds`, `Changes`, `Updates`, `Fixes`, or `Removes`. Keep commit subjects in the standard imperative form, such as `Add`, `Change`, or `Fix`.