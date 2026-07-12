FROM node:26-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:26-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
RUN groupadd -r ensage && useradd -r -g ensage ensage && mkdir -p /app/data/storage && chown -R ensage:ensage /app/data
COPY --from=build --chown=ensage:ensage /app/.next/standalone ./
COPY --from=build --chown=ensage:ensage /app/.next/static ./.next/static
COPY --from=build --chown=ensage:ensage /app/public ./public
COPY --from=build --chown=ensage:ensage /app/scripts ./scripts
USER ensage
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)})"
CMD ["node", "server.js"]
