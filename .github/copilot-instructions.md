## Quick context for AI assistants

- This is a static, client-side quiz site (no backend). Core assets live at the repository root and under the `quizzes/` folder. The site is shipped as static HTML/JS/CSS and is commonly hosted on GitHub Pages (see `README.md`).
- Primary entry: `index.html` which loads `script.js`. A separate analysis UI exists in `decision-tree.html` driven by `decision-tree.js`.

## Major components & data flow

- `quizList.json` — master index of quizzes. Each entry uses the shape: `{ "name": ..., "file": "quizzes/xxx.json", "description": ... }`. `script.js` fetches this file and displays entries (latest-first — the array is reversed in code).
- `quizzes/*.json` — quiz data files. Template (see `prompts.md`) includes `title`, `subtitle`, `questions[]` and `descriptions{}`. Answers contain `points` mapping result keys to numeric scores. Example:

```json
{
  "questions": [
    { "question": "Q?", "answers": [{ "text":"A","points":{"hero":1,"anti":0.5}}] }
  ],
  "descriptions": { "hero": { "title":"Hero","emoji":"🦸","subtitle":"...","text":"..." } }
}
```

- `script.js` — main UX: loads quiz list, fetches quizzes, supports file-uploaded quizzes, toggles (dark mode & animations), sharing, and computes scores by summing `points` and choosing the max result.
- `decision-tree.js` — interactive analysis view: incremental score bars, caching for combinatorial analysis, and a separate visual/analysis tab.

## Conventions & patterns (explicit, discoverable)

- Quiz identity: result keys are the keys of `descriptions` (e.g., `hero`). Keep them stable across `questions[].answers[].points` and `descriptions`.
- Display order: quiz list is reversed in JS (newest quizzes appear first). If you add entries to `quizList.json`, push them at the end to make them appear first in the UI.
- Local state & URL: `?quiz=<file>` query param loads a quiz. `script.js` uses `window.history` to push/replace state — preserve the `file` path format (e.g., `quizzes/foo.json`).
- Feature flags stored in `localStorage`: keys `darkMode` (true/false) and `animationEnabled` (true/false).

## Developer workflows

- Serve locally (required because `fetch()` won’t work over `file://`):

  - Quick: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`.
  - Alternatively, use any static server (e.g. `npx http-server`).

- Editing/adding a quiz:
  1. Create `quizzes/<name>.json` following the template in `prompts.md`.
  2. Add an entry to `quizList.json` with `file` pointing to the new JSON.
  3. Open the site locally and use the upload UI to validate the JSON before committing.

## Debugging notes

- Use browser DevTools console — most errors are surfaced there (fetch failures, JSON parse errors). Search for messages like "Erro ao carregar o quiz" or console traces from `script.js` / `decision-tree.js`.
- Shared clipboard and mailto flows are client-only and may fail in headless/CI environments.

## Files to inspect when making changes

- `index.html` — page shell and upload hooks
- `script.js` — main quiz flow, scoring, share, UI toggles
- `decision-tree.js` — analysis, caching, score visualization
- `quizList.json` and `quizzes/*.json` — data model and examples
- `prompts.md` — authoritative template and generation workflow used to create quizzes

## Small guidance for AI edits

- When changing data shapes, update both `script.js` and `decision-tree.js` (they assume `descriptions` keys and `questions[].answers[].points`).
- Preserve result-key naming: changing a key requires updating every `points` mapping and `descriptions` entry.
- Keep quiz JSON reasonably small — the analysis UI warns when quiz size will create combinatorial explosion (>10 questions).

If you'd like, I can: (A) open a representative quiz JSON and annotate it inline, or (B) create a short checklist template to validate new quizzes before PR. Which would you prefer? 
