# ensage

A security-first, self-hosted workspace for sharing text, files, and links. ensage uses Next.js 16, React 19, Clerk, PostgreSQL, Drizzle, shadcn/ui, and local asynchronous object storage. It has no Vercel runtime dependency.

## Architecture

- Clerk authenticates humans; PostgreSQL stores the local user and authorization model.
- Every query is scoped to an owner. Viewer passwords, API keys, and creator management credentials are separate and stored as Argon2id or SHA-256 digests as appropriate.
- Shares have explicit `pending`, `ready`, `trashed`, and `deleted` states.
- File uploads stream to a temporary object and become visible only after an atomic rename and database transition.
- Rate limits and audit events live in PostgreSQL, so they work across PM2 workers.
- User-configurable defaults and limits live in the Settings page rather than environment files.

## Development

Requirements: Node 26, npm 11, PostgreSQL 18, and a Clerk application.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

The Clerk application is linked through the Clerk CLI. Do not commit `.env.local`.

## CLI

Create an API key in the app, then:

```bash
npm link
ensage configure --url https://share.example.com --token ens_xxx
git diff | ensage create --stdin --title "Review diff" --ttl 24
ensage create --file ./build.log
ensage create --link https://example.com
ensage list
ensage trash <share-id>
```

CLI credentials are written with mode `0600` under `~/.config/ensage`.

## Production

Run behind a hardened reverse proxy that enforces TLS, request timeouts, and an infrastructure upload ceiling. Either use Docker Compose or PM2:

```bash
npm ci
npm run db:migrate
npm run build
npm install -g pm2
npm run start:pm2
```

Only infrastructure secrets and paths belong in the environment: PostgreSQL, Clerk, storage path, and port. Product configuration belongs in the application.
