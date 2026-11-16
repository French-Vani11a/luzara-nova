# Luzara Nova launch site

Countdown to 21 November 2026, clue board, and a guess form. Guesses are saved to SQLite and emailed to luzaranova@gmail.com. Two separate apps: a static `frontend/` and a Node/Express `backend/` API.

## Commands
Run from the repo root (Node 20+):
- `npm run install:all` installs root, backend and frontend dependencies
- `npm run dev` starts backend and frontend together (via `concurrently`, installed at the repo root)
- `npm run dev:backend` starts the API (nodemon); port comes from `PORT` in `backend/.env` (`.env.example` says 3000, `frontend/js/config.js` points at 4721, keep them matching)
- `npm run dev:frontend` serves the static frontend on port 5180 (`serve`); the main site is at `/site/`, the launch page at `/`
- `npm --prefix backend start` runs the API without nodemon

There are no tests or linter configured.

## Structure
- `frontend/index.html`, `js/app.js`, `css/styles.css`: public page (countdown, clues, guess form)
- `frontend/site/index.html`, `css/site.css`, `js/site.js`: the main company site (single page: about, services, process, Steakz, capabilities, contact form). Content comes from `Luzara_Nova_Branded_Portfolio.pdf` in the repo root. Not live yet; on launch day replace the countdown `frontend/index.html` with it (fix the `../` asset and config paths when moving)
- `frontend/admin.html`, `js/admin.js`, `css/admin.css`: private page to view and export guesses
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

## Where to edit
- Clue text and unlock dates: `backend/config/clues.js`
- Launch date: `LAUNCH_DATE` in `backend/.env`
- Colours and fonts: top of `frontend/css/styles.css`
- Backend address: `frontend/js/config.js`

## Before going live
- Remove the "Preview launch day" button from `frontend/index.html` and its handler in `frontend/js/app.js`.
- Confirm the Instagram and Facebook links on the main site (`frontend/site/index.html`) are the real profile URLs.
- Change `ADMIN_KEY`, set `NODE_ENV=production` and `CORS_ORIGIN`, and point `LUZARA_API` at the live backend.
- Keep the database file on persistent storage.

@.claude/rules/keep-claude-md-updated.md
