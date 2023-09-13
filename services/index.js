const pm2 = require('pm2');
const logule = require('logule').init(module, "SERVICES");
const { createTask, bulkCreateTasks, getAllTasks } = require('./sql/queries');

async function init() {
  try {
    await require('./sql/initDatabase').applyMigrations();
  } catch (error) {
    logule.error('Could not initialize database:', error);
    return;
  }

  pm2.launchBus((error, bus) => {
    if (error) {
      logule.error('Could not launch PM2 bus:', error);
      process.exit(1);
    }

    bus.on('process:msg', async (packet) => {
      try {
        const { topic, data } = packet.data;
        switch (topic) {
          case 'API/POST/createTask':
            await createTask(data.task);
            break;

          case 'API/POST/bulkCreateTasks':
            await bulkCreateTasks(data.tasks);
            break;

          case 'API/GET/getAllTasks':
            await handleGetAllTasks(packet);
            break;

          default:
            logule.warn('Unknown topic:', topic);
        }
      } catch (err) {
        logule.error('Error processing message:', err);
      }
    });

    bus.on('error', (err) => {
      logule.error('PM2 bus error:', err);
    });
  });
}

async function handleGetAllTasks(packet) {
  try {
    const tasks = await getAllTasks();
    sendResponseToCaller(packet, { tasks });
  } catch (error) {
    logule.error('Error fetching all tasks:', error);
    sendResponseToCaller(packet, { error: error.message });
  }
}

function sendResponseToCaller(packet, data) {
  pm2.sendDataToProcessId(packet.process.pm_id, {
    type: 'process:msg',
    data: {
      topic: 'API/GET/getAllTasks:response',
      data
    }
  });
}

init();
