const PM2 = require('pm2');
const logule = require('logule').init(module, 'API');

module.exports = class IPCConnector {
  
  #requests = {};

  constructor() {
    this.init();
  }

  init() {
    PM2.launchBus((err, bus) => {
      if (err) {
        logule.error('Error launching PM2 bus:', err);
        return false;
      }
      bus.on('process:msg', this.#handleResponse.bind(this));
    });
  }

  #handleResponse(packet) {
    const { topic, data } = packet.data;
    if (topic && topic.endsWith(':response')) {
      const originalTopic = topic.replace(':response', '');
      const request = this.#requests[originalTopic];
      if (request) {
        delete this.#requests[originalTopic];
        if (data.error) {
          request.reject(new Error(data.error));
        } else {
          request.resolve(data.data);
        }
      }
    }
  }

  async getAllTasks() {
    try {
      return new Promise((resolve, reject) => {
        const topic = 'API/GET/getAllTasks';
        this.#requests[topic] = { resolve, reject };
        PM2.sendDataToProcessId(process.env.SERVICE_PROCESS_ID, { type: 'process:msg', data: { topic } });
      });
    } catch (err) {
      logule.error('Error in getAllTasks:', err);
      throw err;
    }
  }

  createTask = async (task) => {
    try {
      await PM2.sendDataToProcessId('API/POST/createTask', { task });
    } catch (err) {
      logule.console.error(err);
    }
  }

  bulkCreateTasks = async (task) => {
    try {
      await PM2.sendDataToProcessId('API/POST/bulkCreateTasks', { task });
    } catch (err) {
      logule.console.error(err);
    }
  }

  createTask = async (task) => {
    try {
      await PM2.launchBus((err, bus) => {
        bus.on('API/GET/getAllTasks', async packet => {
          const { topic, data } = packet.data;
          return data;
        });
      });
    } catch (err) {
      logule.console.error(err);
    }
  }
}