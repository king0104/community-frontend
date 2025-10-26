# Repository Guidelines

## Project Structure & Module Organization
Source is a lightweight Express static server. The entry point `server.js` only wires routes and exposes everything under `public/`. HTML views live in `public/pages/`, scoped scripts in `public/js/pages/`, shared helpers in `public/js/utils/`, and configuration snippets in `public/js/config/`. Stylesheets are grouped under `public/css/`. Keep new assets close to their consuming page; e.g., a dashboard page belongs in `public/pages/dashboard.html` with supporting CSS/JS siblings under matching subfolders.

## Build, Test, and Development Commands
- `npm install` — install Express and Nodemon once per checkout.
- `npm start` — run the production server (`node server.js`) on port 3000 for smoke testing the built assets.
- `npm run dev` — launch Nodemon for rapid local development; files under `server.js` restart automatically, while static assets hot-reload via the browser.
If you change the port or add environment flags, mirror them inside `server.js` so other contributors inherit the same behavior.

## Coding Style & Naming Conventions
Follow the existing 4-space indentation in JavaScript and HTML; keep CSS at 2 spaces for readability. Use camelCase for variables/functions inside `public/js`, kebab-case for filenames (`post-detail.html`, `post-detail.css`), and BEM-inspired selectors when extending shared styles (`.post-card__title`). Keep server-side comments short and purposeful, using the `// ============================================` banner only for major sections to avoid noise. Run assets through prettier (default settings) before committing if you have it locally; otherwise, ensure consistent spacing manually.

## Testing Guidelines
There is no automated test harness yet, so rely on manual verification: start the server, hit `http://localhost:3000/login`, and navigate through signup, posts list, detail, and create views. Validate responsive behavior at 360px, 768px, and desktop widths, and test file uploads or form submissions if your change touches them. When adding utility JS, create a minimal demo block in the relevant HTML page so reviewers can trigger the behavior without extra setup.

## Commit & Pull Request Guidelines
Follow the repository’s short Conventional-style messages (`feat:`, `fix:`, `chore:`) plus a concise Korean or English summary, e.g., `feat: 게시글 조회 페이지 개발`. Reference issues inside the body (`Refs #42`) when applicable. Pull requests should include: purpose summary, affected pages/assets, reproduction or verification steps (commands + URLs), and screenshots or GIFs for visible UI changes. Keep PRs scoped to a single feature or bug; split out refactors or asset reorganizations to separate commits for easier review.
