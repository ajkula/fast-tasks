const db = require('./initDatabase').db;
const logule = require('../logger');
const logger_auth = require('../logger_auth');
const bcrypt = require('bcrypt');

/**
 * Hash a password asynchronously
 * 
 * @param {string} password - The user's password.
 * @returns {Promise<string>} - A promise that resolves with the hashed password.
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * 
 * @param {string} password - The plain-text password to verify.
 * @param {string} hash - The hashed password to verify against.
 * @returns {Promise<boolean>} - A promise that resolves with the verification result.
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Create a user in the database.
 * 
 * @param {Object} user - A user object; must contain valid field names and values for the 'users' table in the database
 * @returns {Promise<string|null>} - A promise that resolves with a JWT, or null if authentication fails.
 */
async function createUser(user) {
  try {
    if (user === undefined) throw new Error({ message: "Bad Request", statusCode: 400 })
    // Hash the user's password before storing it
    user.pass = await hashPassword(user.password);

    const fields = Object.keys(user).join(', ');
    const placeholders = Object.keys(user).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(user);
    const sql  = `INSERT INTO users (${fields}) VALUES (${placeholders})`;
    await db.query(sql, values);
    
    // Generate a JWT
    const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return token;
  } catch (err) {
    logger_auth.warn('Failed to create user', err);
    throw new Error({ message: 'Failed to create user', statusCode: 500 });
  }
}

/**
 * Authenticate a user and return a JWT.
 * 
 * @param {string} usernam - The user's identifier (e.g., username or email).
 * @param {string} pass - The user's password.
 * @returns {Promise<string|null>} - A promise that resolves with a JWT, or null if authentication fails.
 */
async function authenticateUser(username, pass) {
  try {
    // Fetch the user from the database
    const sql = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(sql, [username]);
    const user = result.rows[0];

    if (!user) {
      logger_auth.warn('User not found');
      return null;
    }

    // Verify the password
    const passwordMatches = await verifyPassword(pass, user.pass);
    if (!passwordMatches) {
      logger_auth.warn('Incorrect password');
      return null;
    }

    // Generate a JWT
    const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return token;
  } catch (err) {
    logger_auth.error('Authentication error', err);
    throw new Error({ message: 'Authentication error', statusCode: 500 });
  }
}

/**
 * Create a new task in the database.
 * 
 * @param {Object} task - A task object to be created; must contain valid field names and values for the 'tasks' table in the database.
 * @throws Will throw an error if the query fails for any reason.
 */
async function createTask(task) {
  try {
    const fields = Object.keys(task).join(', ');
    const placeholders = Object.keys(task).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(task);
    const sql = `INSERT INTO tasks (${fields}) VALUES (${placeholders});`;
    await db.query(sql, values);
  } catch (err) {
    logule.error('Could not create tasks:', err);
    throw new Error({ message: 'Bad Request', statusCode: 400});
  }
}

/**
 * Create multiple new tasks in the database.
 * 
 * @param {Object[]} tasks - An array of objects, each representing a task to be created; each must contain valid field names and values for the 'tasks' table in the database.
 * @throws Will throw an error if no tasks are provided or if the query fails for any reason.
 */
async function bulkCreateTasks(tasks) {
  if (!tasks.length) {
    throw new Error({ message: 'Bad Request', statusCode: 400});
  }
  try {
    const fields = Object.keys(tasks[0]).join(', ');
    const placeholders = tasks.map((_, index) => `(${Object.keys(tasks[0]).map((_, subIndex) => `$${subIndex + 1 + index * Object.keys(tasks[0]).length}`).join(', ')})`).join(', ');
    const values = tasks.flatMap(Object.values);
    const sql = `INSERT INTO tasks (${fields}) VALUES ${placeholders};`;
    await db.query(sql, values);
  } catch (err) {
    logule.error('Could not retrieve tasks:', err);
    throw new Error({ message: 'Bad Request', statusCode: 400});
  }
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
    throw new Error({ message: 'Bad Request', statusCode: 400});
  }
}

module.exports = { createUser, authenticateUser, createTask, bulkCreateTasks, getAllTasks };
