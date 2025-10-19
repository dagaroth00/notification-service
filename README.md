# notification-service

Simple notification microservice (TypeScript + Express + Socket.IO).

## Prerequisites
- Node.js 18+ and npm
- A `.env` file at the project root for environment variables (see `src` for usage). Example variables the project may expect:
  - PORT
  - REDIS_URL
  - JWT_ISSUER / JWKS settings (if using auth middleware)

## Install
Open a command prompt in the project root and run:

```bat
npm install
```

## Run in development
This project includes a dev script that runs TypeScript directly using `ts-node`.

```bat
npm run dev
```

This will execute `ts-node src/app.ts` (hot-reload via `ts-node-dev` is not wired into the npm script by default; you can run `npx ts-node-dev --respawn src/app.ts` if you prefer faster restarts).

## Build and run (production)
Compile TypeScript to `dist/` and run the compiled app:

```bat
npm run build
npm start
```

`build` uses `tsc` and `start` runs `node dist/app.js`.

## Useful scripts
- `npm run dev` — run TypeScript directly for development
- `npm run build` — compile TypeScript to JavaScript in `dist/`
- `npm start` — run compiled app from `dist/`
- `npm test` — placeholder (no tests configured)

## Notes
- Check `package.json` scripts if you need custom start commands.
- Ensure required environment variables are set in `.env` or your environment before starting.
- If you use Docker or a process manager (PM2), adapt the `npm run build` + `npm start` flow for production.

## Prisma
This project uses Prisma for database access. Before running migrations or opening Prisma Studio, ensure your `DATABASE_URL` is set in the `.env` file at the project root.

Run these commands from the project root when you need to initialise the database and generate the Prisma client:

```bat
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

- `migrate dev --name init` runs migrations and updates the database (creates migration files).
- `generate` generates the Prisma client used by the app.
- `studio` opens Prisma Studio (a web GUI) to inspect and edit data.

---

If you'd like, I can add a sample `.env.example` and a short development note for using `ts-node-dev` for auto-restarts.