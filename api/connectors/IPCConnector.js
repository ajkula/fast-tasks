const PM2 = require('pm2');
const logule = require('logule').init(module, 'API');
const process = require('process');

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

module.exports = class IPCConnector {
  requests = new Map();

  constructor() {
    this.init();
  }

  /**
   * Initializes the PM2 bus and listens for 'process:msg' events.
   */
  init() {
    PM2.connect((err) => {
      if (err) {
        logule.error('PM2 connection error:', err);
        process.exit(2);
      }

      PM2.list((err, list) => {
        if (err) {
          logule.error('PM2 list error:', err);
          process.exit(2);
        }

        const serviceProcess = list.find(({ name }) => name === 'SERVICE');
        if (serviceProcess) {
          process.env.SERVICE_PROCESS_ID = serviceProcess.pm_id;
        } else {
          logule.error('Could not find SERVICE process');
          process.exit(2);
        }
      });
    });

    PM2.launchBus((err, bus) => {
      if (err) {
        logule.error('Error launching PM2 bus:', err);
        return false;
      }
      bus.on('process:msg', this.#handleResponse.bind(this));
    });

    // interval pour nettoyer les requêtes périmées.
    setInterval(() => {
      const now = Date.now();
      for (const [key, { timestamp }] of this.requests.entries()) {
        if (now - timestamp > 30000) {
          delete this.requests[key];
        }
      }
    }, 10000);
  }

  /**
   * Handles the responses received on the PM2 bus.
   * @private
   * @param {object} packet - The packet containing response data.
   */
  #handleResponse({ raw: { data } }) {
    const { topic, type, ...responseData } = data;

    if (topic.match(':response')) {
      const originalTopic = topic.replace(':response', '');

      if (this.requests.has(originalTopic)) {
        const request = this.requests.get(originalTopic);

        if (responseData.data.responseType !== 'success') {
          request.reject(new Error((responseData.data || {}).error));
        } else {
          request.resolve((responseData.data || {}).tasks);
        }
      }
    }
  }

  /**
   * Login user
   */
  login = async user => {
    try {
      return new Promise((resolve, reject) => {
        const topic = 'API/POST/Auth';
        this.requests.set(topic, { resolve, reject, timestamp: Date.now() });

        process.send({
          data: {
            type: 'process:msg',
            topic,
            user,
          }
        });
      });
    } catch (err) {
      logule.error('Error in login:', err, err.stack);
      throw err;
    }
  }

  /**
   * User signin
   */
  signin = async user => {
    try {
      return new Promise((resolve, reject) => {
        const topic = 'API/POST/createUser';
        this.requests.set(topic, { resolve, reject, timestamp: Date.now() });

        process.send({
          data: {
            type: 'process:msg',
            topic,
            user,
          }
        });
      });
    } catch (err) {
      logule.error('Error in signin:', err, err.stack);
      throw err;
    }
  }

  /**
   * Retrieves all tasks by sending a message via PM2 to a specified process ID.
   * @returns {Promise<object[]>} - A promise that resolves with all {@link Task}.
   */
  getAllTasks = async () => {
    try {
      return new Promise((resolve, reject) => {
        const topic = 'API/GET/getAllTasks';
        this.requests.set(topic, { resolve, reject, timestamp: Date.now() });

        process.send({
          data: {
            type: 'process:msg',
            topic,
          },
        });

      });
    } catch (err) {
      logule.error('Error in getAllTasks:', err, err.stack);
      throw err;
    }
  }

  /**
   * Sends a request to create a task via PM2.
   * @param {object} {@link Task} - The task details to create.
   */
  createTask = async (task) => {
    try {
      const topic = 'API/POST/createTask';
      process.send({
        data: {
          type: 'process:msg',
          topic,
          task
        },
      });
    } catch (err) {
      logule.error('Error in createTask:', err);
      throw err;
    }
  }

  /**
   * Sends a bulk create tasks request via PM2.
   * @param {object} {@link Task} - The details of tasks to create in bulk.
   */
  bulkCreateTasks = async (tasks) => {
    const topic = 'API/POST/bulkCreateTasks';
    
    try {
      process.send({
        data: {
          type: 'process:msg',
          topic,
          tasks
        },
      });
    } catch (err) {
      logule.error('Error in bulkCreateTasks:', err);
      throw err;
    }
  }
}