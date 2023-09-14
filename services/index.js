require('dotenv').config();
const pm2 = require('pm2');
const logule = require('logule').init(module, "SERVICES");
const { createTask, bulkCreateTasks, getAllTasks } = require('./sql/queries');

async function init() {
  try {
    await require('./sql/initDatabase').applyMigrations();
  } catch (error) {
    logule.error('Could not initialize database:', error);
    return false;
  }

  pm2.launchBus((error, bus) => {
    if (error) {
      logule.error('Could not launch PM2 bus:', error);
      process.exit(1);
    }

    const handlers = {
      'API/POST/createTask': handleCreateTask,
      'API/POST/bulkCreateTasks': handleBulkCreateTasks,
      'API/GET/getAllTasks': handleGetAllTasks,
    };

    bus.on('process:msg', async ({ raw: { data }, process: { pm_id } }) => {
      const { topic } = data;
      const handler = handlers[topic];

      if (handler) {
        try {
          await handler({ ...data, pm_id, });
        } catch (err) {
          logule.error('Error processing message:', err.message, err.stack);
        }
      } else {
        logule.warn('Unknown topic:', topic);
      }
    });
  });
}

async function handleCreateTask(data) {
  try {
    if (data.task === undefined) throw new Error({ message: "Unknown payload" });
    await createTask(data.task);
    return { success: true };
  } catch (error) {
    logule.error('Error sending task to service:', error);
    return { error: error.message };
  }
}

async function handleBulkCreateTasks(data) {
  try {
    if (data.tasks === undefined) throw new Error({ message: "Unknown payload" });
    await bulkCreateTasks(data.tasks);
    return { success: true };
  } catch (error) {
    logule.error('Error sending all tasks to service:', error);
    return { error: error.message };
  }
}

async function handleGetAllTasks(packet) {
  try {
    const tasks = await getAllTasks();
    sendResponseToCaller(packet, { tasks });
  } catch (error) {
    logule.error('Error fetching all tasks:', error);
    sendResponseToCaller(packet, { error: error.message });
    return { error: error.message };
  }
}

function sendResponseToCaller(data, response) {
  const responseType = response.error ? 'error' : 'success';

  try {
    process.send({
      data: {
        type: 'process:msg',
        topic: `${data.topic}:response`,
        data: {
          ...response,
          responseType,
        },
      },
    });
  } catch (err) {
    logule.error(err.message, err)
  }

}

init();