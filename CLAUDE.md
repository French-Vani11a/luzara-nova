# Luzara Nova launch site

Main company site (`frontend/site/`) plus a legacy guess/clue API in the backend; the countdown front end was removed. Guesses are saved to SQLite and emailed to luzaranova@gmail.com. Two separate apps: a static `frontend/` and a Node/Express `backend/` API.

## Commands
Run from the repo root (Node 20+):
- `npm run install:all` installs root, backend and frontend dependencies
- `npm run dev` starts backend and frontend together (via `concurrently`, installed at the repo root)
- `npm run dev:backend` starts the API (nodemon); port comes from `PORT` in `backend/.env` (`.env.example` says 3000, `frontend/js/config.js` points at 4721, keep them matching)
- `npm run dev:frontend` serves the static frontend on port 5180 (`serve`); `frontend/serve.json` redirects `/` to the main site at `/site/` (the countdown and admin pages were removed from `frontend/`)
- `npm --prefix backend start` runs the API without nodemon

There are no tests or linter configured.

## Structure
- `frontend/site/index.html`, `css/site.css`, `js/site.js`: the main company site (single page: about, services, process, Steakz, capabilities, contact form). Content comes from `Luzara_Nova_Branded_Portfolio.pdf` in the repo root. Served at `/site/`; the `../` asset and config paths matter if it moves to the root
- `frontend/js/config.js`: sets `LUZARA_API`, the backend address
- `backend/server.js`: entry point (helmet, cors, JSON body limit 10kb, `/api` routes, error handler)
- `backend/routes/api.js`: `GET /api/config`, `POST /api/guesses` (rate limited, 10 per 15 min), `POST /api/contact` (main site enquiry form, saved to `contact_messages` and emailed, 5 per 15 min), `GET /api/admin/guesses`, `GET /api/admin/guesses.csv` (admin key required). Contact messages have no admin view yet; read them in the DB or the inbox
- `backend/controllers/guessController.js`: request handlers
- `backend/middleware/`: `validate.js` (guess and contact validation), `adminAuth.js` (ADMIN_KEY check), `errorHandler.js`
- `backend/config/`: `env.js` (reads `backend/.env`), `db.js` (creates DB and tables on start), `clues.js` (clue text and unlock dates)
- `backend/utils/mailer.js`: Gmail sending via nodemailer
- `backend/data/`: `luzaranova.db` is created here (git-ignored)

## Conventions
- Backend is CommonJS (`require`), Express 4, `better-sqlite3`.
- Save the guess to the database before sending email, so a mail failure never loses a guess.
- Settings come from `backend/.env` (see `backend/.env.example`); never commit `.env` or the database.
- API responses use `{ ok: boolean, message?: string, ... }`.
- Frontend is plain HTML/CSS/JS with no build step.
- Main site design (`frontend/site/css/site.css`): white/light page with a frosted-glass floating nav (white translucent, dark-text logo `logo-main-dark.png`) and a navy footer (`.dark`), electric-blue palette, Sora headings with Inter body. The style is flat: solid colours only, no gradients or glows (accent is `--accent` blue and `--cyan`). Content is laid out openly, not in boxes: `.card` is just a top hairline with a numbered heading, services are two-column rows, "Why" is a list of rows, and the contact form has no panel. Background decoration is the LN logo mark traced as an SVG `<symbol id="ln-mark">` at the top of `frontend/site/index.html`; the "Background art" block in `site.js` scatters LN mark copies into every `.hero` and `.sec` automatically (`<svg class="deco fill">`, styled in `site.css`): 3 big ones per section (170 to 340px) at random spots that avoid text (on desktop a shape is dropped if no empty spot; on mobile text fills the width, so shapes are never dropped and may bleed off the left/right edges, never the top/bottom). Solid lilac and pale cyan fills only, no outlines, tilted up to 20deg from a fixed seed; positions recompute on load, font load and resize. Keep them low contrast. Nothing to add per section. Avoid adding bordered or filled cards; the only boxed element is the hero dashboard mock-up. Sections use the light theme (variables on `:root`; `.sec.alt` is a pale blue-grey). Only the footer carries `.dark` (navy) because the main site logo (`frontend/assets/logo-main.png`, blue/cyan LN mark with white text, transparent background) is made for dark backgrounds, so keep it on navy. `frontend/assets/favicon.png` is the LN mark alone. Colours are CSS variables at the top of the file. The hero dashboard is animated in `frontend/site/js/site.js` (count-up numbers, drifting bars, cycling notification cards, cursor tilt); it is skipped when the visitor prefers reduced motion, and the tilt only runs on desktop with a mouse.

## Where to edit
- Clue text and unlock dates: `backend/config/clues.js`
- Launch date: `LAUNCH_DATE` in `backend/.env`
- Colours and fonts: top of `frontend/site/css/site.css`
- Backend address: `frontend/js/config.js`

## Before going live
- Confirm the Instagram and Facebook links on the main site (`frontend/site/index.html`) are the real profile URLs.
- Change `ADMIN_KEY`, set `NODE_ENV=production` and `CORS_ORIGIN`, and point `LUZARA_API` at the live backend.
- Keep the database file on persistent storage.

@.claude/rules/keep-claude-md-updated.md
