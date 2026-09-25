# AGENTS.md

Instructions for AI agents working in this repository.

## Basic policy

- Refer to [docs/project.md](docs/project.md) for the project's requirements and technical composition.
- If requirements change or are added during a session, update [docs/project.md](docs/project.md) to match.
- Follow the existing code conventions (naming, directory structure, styling approach, error handling, etc.).
- If anything in an issue or instruction is unclear, ask the user instead of guessing.

## Checks before and after work

- Use pnpm as the package manager (managed via `pnpm-lock.yaml`).
- After making changes, confirm that `pnpm lint` (Biome) and `pnpm build` (`tsc -b` + Vite) pass.
- Do not push directly to `main`.
