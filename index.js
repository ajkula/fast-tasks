const pm2 = require('pm2');
const logule = require('logule').init(module, 'PM2_INIT');

const environment = process.env.NODE_ENV || "development";

if (environment === "development") {
  logule.debug("Development environment detected");
}

// Connecting to PM2 and starting the applications defined in ecosystem.config.js
pm2.connect((err) => {
  if (err) {
    logule.error("Connection error with PM2:", err);
    process.exit(2);
  }

  pm2.start('ecosystem.config.js', { env: environment }, (err) => {
    if (err) {
      logule.error("Error starting PM2 with the specified configuration:", err);
      process.exit(2);
    }

    logule.debug("PM2 successfully started.");
  });
});

// Handling graceful exit
process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

function gracefulExit() {
  logule.warn("Received a termination signal, gracefully shutting down...");

  pm2.stop('ecosystem.config.js', (err) => {
    if (err) {
      logule.error("Error stopping PM2:", err);
      return process.exit(2);
    }

    logule.warn("PM2 successfully stopped.");
    pm2.disconnect(() => {
      process.exit(0);
    });
  });
}
