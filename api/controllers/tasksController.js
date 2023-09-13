const express = require('express');

/**
 * @typedef {Object} Task
 * @property {number} id - Unique identifier for the task (read-only)
 * @property {string} title - Title of the task (max length: 255)
 * @property {string} content - Content of the task
 * @property {("Pending"|"In Progress"|"Completed"|"On Hold")} status - Current status of the task (default: "Pending")
 * @property {("Low"|"Normal"|"High"|"Urgent")} priority - Priority level of the task (default: "Normal")
 * @property {string} created_at - Date and time when the task was created (read-only, format: date-time)
 * @property {string} updated_at - Date and time of the last update of the task (read-only, format: date-time)
 */

module.exports = class TasksController {
  constructor(container) {
    this.container = container;
    this.router = express.Router();

    this.router.get('/tasks', this.getAllTasks.bind(this));
    this.router.post('/task', this.createTask.bind(this));
    this.router.post('/tasks/bulk', this.bulkCreateTasks.bind(this));
  }

  /**
   * Get all tasks.
   *
   * @param {express.Request} req - The express request object.
   * @param {express.Response} res - The express response object.
   * @returns {Promise<void>} - Sends a JSON response with an array of {@link Task} objects or an error message.
   */
  async getAllTasks(req, res) {
    try {
      const tasks = await this.container.tasksModel.getAllTasks();
      res.status(200).json(tasks);
    } catch (error) {
      this.container.LOGGER.error('Error in getAllTasks:', error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Create a new task.
   *
   * @param {express.Request} req - The express request object. Expects a {@link Task} object in the request body.
   * @param {express.Response} res - The express response object.
   * @returns {Promise<void>} - Sends a JSON response with a success message or an error message.
   */
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

  /**
   * Create multiple new tasks in a bulk operation.
   *
   * @param {express.Request} req - The express request object. Expects an array of {@link Task}{Task} objects in the request body.
   * @param {express.Response} res - The express response object.
   * @returns {Promise<void>} - Sends a JSON response with a success message or an error message.
   */
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
