---
description: Workflow for committing with international-standard commit messages (English only)
auto_execution_mode: 3
---

# Workflow: Commit with International-Standard Commit Message (English Only)

This workflow guides you to commit staged files using a professional commit message that follows current international standards (e.g., Conventional Commits). Commit messages must be written in English. This workflow does not include pushing to the remote origin.

## Steps

1. **Review all staged files and their changes**

   - List all staged files:
     ```bash
     git diff --cached --name-only
     ```
   - For each staged file, review its diff in detail:
     ```bash
     git diff --cached <file>
     ```
   - Carefully review and note the changes for every staged file, not just the largest or first/second file.

2. **Write a commit message in English, with a detailed summary for ALL staged files, following international standards**

   - Use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format:
     ```
     <type>[optional scope]: <description>
     [optional body]
     [optional footer(s)]
     ```
   - Do not omit any file or significant change.
   - Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - **Commit messages must always be in English and directly relate to the staged changes.**

3. **Commit the staged files with your commit message**
   - Run:
     ```bash
     git commit -m "<your English commit message>"
     ```

## Tips

- Always review the actual diff of staged files before writing your commit message.
- Ensure your commit message is clear, concise, in English, and directly describes the staged changes for each file.
- For breaking changes, use the `BREAKING CHANGE:` footer.
- You can automate all steps in this workflow (status, diff, message, commit) without requiring confirmation for each step, for a seamless and efficient workflow.
- Just do every step above without confirmation question.

## References

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Git Commit Message Guidelines (Angular)](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
