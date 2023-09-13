const db = require('./initDatabase').db;


async function createTask(task) {
  const fields = Object.keys(task).join(', ');
  const placeholders = Object.keys(task).fill('?').join(', ');
  const values = Object.values(task);

  const sql = `INSERT INTO tasks (${fields}) VALUES (${placeholders})`;

  await db.query(sql, values);
}

async function bulkCreateTasks(tasks) {
  if (!tasks.length) {
    throw new Error('No tasks to create');
  }

  const fields = Object.keys(tasks[0]).join(', ');
  const placeholders = tasks.map(task => `(${Object.keys(task).fill('?').join(', ')})`).join(', ');
  const values = tasks.flatMap(Object.values);

  const sql = `INSERT INTO tasks (${fields}) VALUES ${placeholders}`;

  await db.query(sql, values);
}

async function getAllTasks() {
  try {
    const [rows, fields] = await db.query('SELECT * FROM tasks');
    return rows;
  } catch (error) {
    console.error('Could not retrieve tasks:', error);
    throw error;
  }
}
