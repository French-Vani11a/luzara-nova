# Luzara Nova launch site

Countdown to 21 November 2026, clue board, and a guess form. Guesses are saved in a database and emailed to luzaranova@gmail.com.

The project is two separate apps:

```
luzara-nova/
├── frontend/               What visitors see (HTML, CSS, JS)
│   ├── index.html          Countdown, clues, guess form
│   ├── admin.html          Private page to view and export guesses
│   ├── js/config.js        Address of the backend (LUZARA_API)
│   ├── css/  js/  assets/
│   └── package.json
├── backend/                The API (Node + Express + SQLite)
│   ├── server.js           Entry point
│   ├── .env / .env.example Settings and secrets
│   ├── config/             env.js, db.js, clues.js
│   ├── routes/             api.js
│   ├── controllers/        guessController.js
│   ├── middleware/         validate.js, adminAuth.js, errorHandler.js
│   ├── utils/              mailer.js (Gmail)
│   ├── data/               luzaranova.db is created here
│   └── package.json
└── package.json            Shortcuts to install and run both
```

## Run it
Needs Node.js 20 or newer. Open two terminals in VS Code.

```
npm run install:all
```
Terminal 1 (backend, port 3000):
```
npm run dev:backend
```
Terminal 2 (frontend, port 5173):
```
npm run dev:frontend
```
Open http://localhost:5173

## Receive guesses in Gmail
1. Sign in to luzaranova@gmail.com and turn on 2-Step Verification.
2. Google Account > Security > App passwords. Create one called "Luzara Nova site".
3. Paste the 16 characters into `EMAIL_PASS` in `backend/.env`, then restart the backend.

Every guess is saved in the database first, so nothing is lost if an email fails.

## Admin
Open http://localhost:5173/admin.html and enter `ADMIN_KEY` from `backend/.env`. You can view all guesses and download a CSV. Change `ADMIN_KEY` before you deploy.

## Edit
- Clue text and unlock dates: `backend/config/clues.js`
- Launch date: `LAUNCH_DATE` in `backend/.env`
- Colours and fonts: top of `frontend/css/styles.css`
- Backend address: `frontend/js/config.js`
- Before going live, remove the "Preview launch day" button from `frontend/index.html` and its handler in `frontend/js/app.js`.

## Deploy
- Backend: any Node host (Render, Railway, a VPS). Set the variables from `backend/.env.example`, set `NODE_ENV=production`, set `CORS_ORIGIN` to your website address, keep the database file on persistent storage.
- Frontend: any static host (Netlify, Vercel, GitHub Pages, cPanel). Set `LUZARA_API` in `frontend/js/config.js` to your live backend address first.
