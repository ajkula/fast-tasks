const db = require('./initDatabase').db;
const logule = require('../logger');

/**
 * Create a new task in the database.
 * 
 * @param {Object} task - An object representing the task to be created; must contain valid field names and values for the 'tasks' table in your database.
 * @throws Will throw an error if the query fails for any reason.
 */
async function createTask(task) {
  const fields = Object.keys(task).join(', ');
  const placeholders = Object.keys(task).map((_, index) => `$${index + 1}`).join(', ');
  const values = Object.values(task);
  const sql = `INSERT INTO tasks (${fields}) VALUES (${placeholders});`;
  await db.query(sql, values);
}

/**
 * Create multiple new tasks in the database.
 * 
 * @param {Object[]} tasks - An array of objects, each representing a task to be created; each must contain valid field names and values for the 'tasks' table in your database.
 * @throws Will throw an error if no tasks are provided or if the query fails for any reason.
 */
async function bulkCreateTasks(tasks) {
  if (!tasks.length) {
    throw new Error({ message: 'Bad Request', statusCode: 400});
  }

  const fields = Object.keys(tasks[0]).join(', ');
  const placeholders = tasks.map((_, index) => `(${Object.keys(tasks[0]).map((_, subIndex) => `$${subIndex + 1 + index * Object.keys(tasks[0]).length}`).join(', ')})`).join(', ');
  const values = tasks.flatMap(Object.values);
  const sql = `INSERT INTO tasks (${fields}) VALUES ${placeholders};`;
  await db.query(sql, values);
}

/**
 * Retrieve all tasks from the database.
 * 
 * @returns {Promise<Object[]>} - A promise that resolves to an array of objects, each representing a task retrieved from the database.
 * @throws Will throw an error if the query fails for any reason.
 */
async function getAllTasks() {
  try {
    const res = await db.query('SELECT * FROM tasks;');
    return res.rows;
  } catch (error) {
    logule.error('Could not retrieve tasks:', error);
    throw error;
  }
}

module.exports = { createTask, bulkCreateTasks, getAllTasks };
