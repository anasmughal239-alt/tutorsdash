<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Coding Tasks

When spawning Claude Code sessions for coding work, tell the session to use gstack skills.

Examples:

- **Security audit:** "Load gstack. Run /cso"
- **Code review:** "Load gstack. Run /review"
- **QA test a URL:** "Load gstack. Run /qa https://..."
- **Build a feature end-to-end:** "Load gstack. Run /autoplan, implement the plan, then run /ship"
- **Plan before building:** "Load gstack. Run /office-hours then /autoplan. Save the plan, don't implement."
