module.exports = {
  apps: [
    {
      name: 'darkwebmonitor-api',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 4002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4002
      },
      error_file: '/var/log/pm2/darkwebmonitor-error.log',
      out_file: '/var/log/pm2/darkwebmonitor-out.log',
      log_file: '/var/log/pm2/darkwebmonitor-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    }
  ]
};
