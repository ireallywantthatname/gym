## Workflow and Design Preferences

- Plan before writing code when asked, and wait for explicit approval before modifying files.
- Commit each logical change separately as an atomic Git commit.
- Build exclusively for mobile viewports (`100dvh`) with fast, snappy, zero-latency interactions.
- Follow Microsoft Metro design language: sharp `0px` corners, true `1:1` square tiles (`aspect-square`), bold flat colors, lowercase typography, and classic 3D Turnstile transitions between screens.
- Keep the UI strictly minimal. Never add unrequested headers, user badges, tile sub-captions, footers, helper text, or empty-state cards.
- Auto-save all text inputs (workout slots and workout notes) as the user types. Do not add save or add buttons.
- Always render 7 fixed workout blocks per day in the swipeable schedule editor carousel.
- Maintain identical views for both users (`akash` and `achini`) with instant user switching and light/dark mode toggling from the `edit` screen.
- Keep responses, plans, and documentation minimal and concise.
- Execute tasks directly without unnecessary narration or filler text.
- Never use em dashes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
