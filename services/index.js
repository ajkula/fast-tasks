require('dotenv').config();
const pm2 = require('pm2');
const logule = require('./logger');
const { createUser, authenticateUser, createTask, bulkCreateTasks, getAllTasks } = require('./sql/queries');

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
      'API/POST/Auth': handleAuth,
      'API/POST/createUser': handleCreateUser,
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

async function handleAuth(packet) {
  try {
    if (packet.user === undefined) throw new Error({ message: "Bad Request" });
    const token = await authenticateUser(packet.user.username, packet.user.pass);
    console.log("AUTH: ", token);
    sendResponseToCaller(packet, { token, responseType: "success" });
  } catch(err) {
    sendResponseToCaller(packet, { error: err.message });
    return { error: err.message };
  }
}

async function handleCreateUser(packet) {
  try {
    if (packet.user === undefined) throw new Error({ message: "Bad Request" });
    const token = await createUser(packet.user);
    sendResponseToCaller(packet, { token, responseType: "success" });
  } catch (err) {
    sendResponseToCaller(packet, { error: err.message });
    return { error: err.message };
  }
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
    sendResponseToCaller(packet, { tasks, responseType: "success" });
  } catch (error) {
    logule.error('Error fetching all tasks:', error);
    sendResponseToCaller(packet, { error: error.message });
    return { error: error };
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
module.exports = {
  init,
  handleCreateTask,
  handleCreateUser,
  authenticateUser,
};