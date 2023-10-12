const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = class Server {
  constructor(container) {
    this.container = container;
    this.app = express();
    this.app.use(express.json());
    this.loadDBs();
    this.loadControllers();

    this.app.use((err, req, res, next) => {
      if (res.headersSent) {
        return next(err);
      }
      res.status(err.statusCode || 500);
      switch (err.statusCode) {
        case 400:
          res.json({ message: err.message || "Bad Request" });
          break;
        case 401:
          res.json({ message: err.message || "Unauthorized" });
          break;
        case 403:
          res.json({ message: err.message || "Forbidden" });
          break;
        case 404:
          res.json({ message: err.message || "Not Found" });
          break;
        case 405:
          res.json({ message: err.message || "Methode Not Allowed" });
          break;
        default:
          res.json({ message: err.message || "Internal Server Error" });
          break;
      }
    });
  }

  async loadDBs() {
    try {
      if (!this.container.tasksModel) {
        this.container.LOGGER.error("Failed to load DBs: tasksModel is not defined in the container.");
      }
    } catch (error) {
      this.container.LOGGER.error("Failed to load DBs:", error);
    }
  }

  loadControllers() {
    try {
      const controllersDir = path.resolve(__dirname, '../controllers');
      const files = fs.readdirSync(controllersDir);
      files.forEach((file) => {
        if (/Controller\.js/.test(file)) {
          const classCtrl = require(path.join(controllersDir, file));
          const Instance = new classCtrl(this.container).router;
          this.app.use(Instance);

          // this.container.LOGGER.info(`Loaded controller: ${file}`);
          // Instance.stack.forEach(layer => this.container.LOGGER.info({path: layer.route.path, method: Object.keys(layer.route.methods)}));
        }
      });
    } catch (error) {
      this.container.LOGGER.error("Failed to load controllers:", error);
    }
  }
}
