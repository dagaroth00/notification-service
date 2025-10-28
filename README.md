# notification-service

Simple notification microservice (TypeScript + Express + Socket.IO).

## Prerequisites
- Node.js 18+ and npm
- A `.env` file at the project root for environment variables (see `src` for usage). Example variables the project may expect:
  - PORT
  - REDIS_URL
  - JWT_ISSUER / JWKS settings (if using auth middleware)
  - AUTH_SERVICE_TIMEOUT_MS (optional timeout override for auth service calls)

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
- Service base URLs (with trailing slashes) and endpoint templates live in `src/constants/serviceApiPaths.ts`; update that file to point at your environments.

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

## Logging

This project uses `pino` for structured logging. You can control log verbosity with the `LOG_LEVEL` environment variable. Supported levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`.

Examples:

- Run in development with debug logs (Windows cmd):

```bat
set LOG_LEVEL=debug && npm run dev
```

- Run production build with info logs:

```bat
set LOG_LEVEL=info && npm run build && npm start
```

- Run compiled app with pretty logs (development friendly):

```bat
set LOG_LEVEL=debug && npm run build && npm run start:dev
```

The `start:dev` script pipes the `node dist/app.js` output through `pino-pretty` for readable console logs. You can change `LOG_LEVEL` to reduce verbosity in staging/production (e.g., `warn` or `error`).

## Auth & WebSocket (AWS Cognito)

This project supports AWS Cognito JWT verification for both REST and WebSocket endpoints. The Express routes use a middleware factory `requireAuth({ required, roles })` for per-route control. The Socket.IO server verifies tokens during handshake and populates `socket.data.user`.

Required environment variables for Cognito integration:

- `AWS_REGION` — AWS region of your Cognito User Pool (e.g. us-east-1)
- `COGNITO_USER_POOL_ID` — your User Pool id
- `COGNITO_APP_CLIENT_ID` — Cognito App Client id used as JWT audience

Example: add to `.env` (do NOT commit secrets)

```bat
set AWS_REGION=us-east-1
set COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
set COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

REST example (create notification, includes Authorization header):

```bat
curl -X POST https://your-api.example.com/api/notifications \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{ \"recipients\": [\"user-1\"], \"title\": \"Hi\", \"body\": \"Hello\" }"
```

Socket.IO client example (handshake token):

```js
// browser or node socket.io-client
import { io } from 'socket.io-client';

const socket = io('https://your-socket.example.com', {
  auth: {
    token: '<ID_TOKEN>'
  }
});

socket.on('connect', () => console.log('connected', socket.id));
socket.on('newNotification', (n) => console.log('notif', n));

// Or send token in Authorization header during websocket handshake
// headers: { Authorization: `Bearer ${token}` }
```

Per-route control
- Use `requireAuth({ required: true })` to require authentication
- Use `requireAuth({ required: false })` to allow anonymous access (but accept token if provided)
- Use `requireAuth({ required: true, roles: ['admin'] })` to require membership in Cognito group `admin` (based on `cognito:groups` claim)

Notes about tests
- I added a small Jest test for the middleware under `testing/__tests__/cognitoAuth.test.ts` and added Jest + ts-jest dev-dependencies. Because this repository uses ESM (package.json "type": "module") Jest needs special ESM handling. If you run into issues running tests locally, see the troubleshooting section below.

Troubleshooting Jest + ESM
- If you get "Cannot use import statement outside a module" errors, ensure you have installed `ts-jest` and used the ESM preset. Running the tests locally (Windows cmd) should work with:

```bat
npm install
npm test
```

If the jest run still errors due to ESM/ts-jest config, an alternative is to temporarily set `type: "commonjs"` in `package.json` while running tests, or to move tests into a compiled `dist/` folder and run against that compiled code.
