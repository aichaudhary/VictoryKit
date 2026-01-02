module.exports = {
  apps: [{
    name: 'threatradar-api',
    script: 'src/server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 4003
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4003
    },
    error_file: '/var/log/pm2/threatradar-error.log',
    out_file: '/var/log/pm2/threatradar-out.log',
    time: true
  }]
};
