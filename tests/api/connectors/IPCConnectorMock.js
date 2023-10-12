module.exports = class IPCConnectorMock {
  getAllTasks = async () => Promise.resolve([]);
  createTask = async (task) => Promise.resolve();
  bulkCreateTasks = async (tasks) => Promise.resolve();
}