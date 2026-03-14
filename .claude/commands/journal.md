Create a new journal entry for today's date in the playfighter project.

Steps:
1. Calculate the current day number using the project's start date of December 6, 2025 (America/New_York timezone). Day 1 = Dec 6, 2025.
2. Check if a post already exists for that day number in `content/posts/day-{N}.md`. If it does, tell me and ask if I want to edit it instead.
3. Format today's date as "Month DD, YYYY" (e.g. "March 13, 2026") for the frontmatter.
4. Take the user's input below and create the markdown file at `content/posts/day-{N}.md` with this format:

```
---
date: "{formatted date}"
---

{user's journal text}
```

5. After creating the file, commit it with message "day {N}" and push to the remote.

The user's journal entry:

$ARGUMENTS
