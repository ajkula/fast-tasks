const express = require('express');
const { BadRequestError } = require('../errors');

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
    this.router.post('/tasks', this.createTask.bind(this));
    this.router.post('/tasks/bulk', this.bulkCreateTasks.bind(this));
  }

  /**
   * Get all tasks.
   *
   * @param {express.Request} req - The express request object.
   * @param {express.Response} res - The express response object.
   * @returns {Promise<void>} - Sends a JSON response with an array of {@link Task} objects or an error message.
   */
  async getAllTasks(req, res, next) {
    try {
      const tasks = await this.container.tasksModel.getAllTasks();
      res.status(200).json(tasks);
    } catch (e) { next(e); }
  }

  /**
   * Create a new task.
   *
   * @param {express.Request} req - The express request object. Expects a {@link Task} object in the request body.
   * @param {express.Response} res - The express response object.
   * @returns {Promise<void>} - Sends a JSON response with a success message or an error message.
   */
  async createTask(req, res, next) {
    try {
      if (!req.body) throw new BadRequestError("Bad Request");
      if (!req.body || !req.body.title || !req.body.content) {
        throw new BadRequestError("Bad Request");
      }
      await this.container.tasksModel.createTask(req.body);
      res.status(201).json({ message: "Created successfully" });
    } catch (e) { next(e); }
  }

  /**
   * Create multiple new tasks in a bulk operation.
   *
   * @param {express.Request} req - The express request object. Expects an array of {@link Task}{Task} objects in the request body.
   * @param {express.Response} res - The express response object.
   * @returns {Promise<void>} - Sends a JSON response with a success message or an error message.
   */
  async bulkCreateTasks(req, res, next) {
    try {
      if (!req.body) throw new BadRequestError("Bad Request");
      if (!req.body || !Array.isArray(req.body) || req.body.length === 0) throw new BadRequestError("Bad Request");
      await this.container.tasksModel.bulkCreateTasks(req.body);
      res.status(201).json({ message: "Bulk creation successful" });
    } catch (e) { next(e); }
  }
}
