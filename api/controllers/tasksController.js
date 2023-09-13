const express = require('express');

module.exports = class TasksController {
  constructor(container) {
    this.container = container;
    this.router = express.Router();

    this.router.get('/tasks', this.getAllTasks.bind(this));
    this.router.post('/task', this.createTask.bind(this));
    this.router.post('/tasks/bulk', this.bulkCreateTasks.bind(this));
  }

  async getAllTasks(req, res) {
    try {
      const tasks = await this.container.tasksModel.getAllTasks();
      res.status(200).json(tasks);
    } catch (error) {
      this.container.LOGGER.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async createTask(req, res) {
    try {
      if (!req.body) throw new Error("Bad Request");
      await this.container.tasksModel.createTask(req.body);
      res.status(201).json({ message: "Created successfully" });
    } catch (error) {
      this.container.LOGGER.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  async bulkCreateTasks(req, res) {
    try {
      if (!req.body) throw new Error("Bad Request");
      await this.container.tasksModel.bulkCreateTasks(req.body);
      res.status(201).json({ message: "Bulk creation successful" });
    } catch (error) {
      this.container.LOGGER.error(error);
      res.status(400).json({ message: error.message });
    }
  }
}
