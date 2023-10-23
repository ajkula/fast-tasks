module.exports = class IPCConnectorMock {
  getAllTasks = async () => Promise.resolve([]);
  createTask = async (task) => Promise.resolve();
  bulkCreateTasks = async (tasks) => Promise.resolve();
  login = async (user) => Promise.resolve({ status: 200, token: "some_token" });
  signin = async (user) => Promise.resolve({ status: 200, token: "some_token" });
}