module.exports = {
  apps : [
    {
      name: 'API',
      script: './api/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        SERVICE_PROCESS_ID: 'service',
      },
      env_production: {
        NODE_ENV: 'production',
        SERVICE_PROCESS_ID: 'service',
      },
    },
    {
      name: 'Service',
      script: './services/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
