const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = class Server {
	constructor (container) {
		this.container = container;
		this.app = express();
		this.app.use(express.json());
		this.loadDBs();
		this.loadControllers();
	}

  async loadDBs () {
    try {
      this.container.tasksModel = new IPCConnector();
    } catch (error) {
      this.container.LOGGER.error("Failed to load DBs:", error);
    }
  }

	loadControllers () {
    try {
      const controllersDir = path.resolve(__dirname, '../controllers');
      const files = fs.readdirSync(controllersDir);
      files.forEach((file) => {
        if (/Controller\.js/.test(file)) {
          const classCtrl = require(path.join(controllersDir, file));
          const Instance = new classCtrl(this.container).router;
          this.app.use(Instance);
  
          this.container.LOGGER.info(`Loaded controller: ${file}`);
          Instance.stack.forEach(layer => this.container.LOGGER.info({path: layer.route.path, method: Object.keys(layer.route.methods)}));
        }
      });
    } catch (error) {
      this.container.LOGGER.error("Failed to load controllers:", error);
    }
  }
}
