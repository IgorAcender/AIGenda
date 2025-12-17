#!/bin/bash
# Ecosystem configuration para PM2
# Gerencia tanto Frontend quanto Backend

module.exports = {
  apps: [
    {
      // ====== BACKEND ======
      name: 'aigenda-api',
      script: 'npm',
      args: 'start --workspace=apps/api',
      cwd: '/var/www/aigenda-saas',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/www/aigenda-saas/logs/api-error.log',
      out_file: '/var/www/aigenda-saas/logs/api.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Reiniciar se der erro 5 vezes em 5 minutos
      max_restarts: 5,
      min_uptime: '10s',
    },
    {
      // ====== FRONTEND ======
      name: 'aigenda-web',
      script: 'npm',
      args: 'start --workspace=apps/web',
      cwd: '/var/www/aigenda-saas',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/aigenda-saas/logs/web-error.log',
      out_file: '/var/www/aigenda-saas/logs/web.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_restarts: 5,
      min_uptime: '10s',
    },
  ],

  // Deploy config (opcional)
  deploy: {
    production: {
      user: 'root',
      host: 'seu-ip-do-servidor',
      ref: 'origin/main',
      repo: 'https://github.com/seu-usuario/AIGenda-SaaS.git',
      path: '/var/www/aigenda-saas',
      'post-deploy': 'npm install && npm run build && pm2 restart ecosystem.config.js',
    },
  },
};
