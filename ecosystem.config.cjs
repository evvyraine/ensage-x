module.exports = {
  apps: [{
    name: "ensage",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    instances: process.env.WEB_CONCURRENCY || 1,
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: "1G",
    kill_timeout: 30000,
    listen_timeout: 10000,
    env: { NODE_ENV: "production", PORT: process.env.PORT || 3000 },
  }, {
    name: "ensage-cleanup",
    script: "scripts/cleanup.mjs",
    args: "--watch",
    instances: 1,
    autorestart: true,
    kill_timeout: 10000,
    env: { NODE_ENV: "production" },
  }],
}
