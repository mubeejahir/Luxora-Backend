# Hotel Booking App — Backend

Minimal backend scaffold converted to a single-entry MVC layout.

Quick start

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `PORT`.
2. Install dependencies:

```powershell
npm install
```

3. Run in development mode (requires `nodemon`):

```powershell
npm run dev
```

4. Or start normally:

```powershell
npm start
```

What changed

- `app.js` now configures and exports the Express `app` (no listener).
- `server.js` is the single server entrypoint: it loads env, connects to the DB, then starts the listener.
- `config/db.js` provides a central DB connect function used by `server.js`.
- Fixed route/controller export mismatch in `routes/index.js`.

Next suggestions

- Add unit/integration tests that import `app` without starting the server.
- Add a lint config (ESLint) and a CI workflow.
- Move `nodemon` to `devDependencies` if desired.
