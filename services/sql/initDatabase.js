const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

const db = mysql.createPool({
  host: 'localhost', // adresse serveur MySQL
  user: 'root',      // nom d'utilisateur MySQL
  password: '',      // mot de passe MySQL
  database: 'fast_tasks', // nom de base de données
});

async function getCurrentDbVersion() {
  try {
    const [rows] = await db.query('SELECT MAX(version) as version FROM db_versions');
    return rows[0].version;
  } catch (error) {
    console.error('Erreur lors de la récupération de la version de la BD :', error);
    return 0;
  }
}

async function applyMigrations() {
  const currentVersion = await getCurrentDbVersion();
  const SQLVersions = [
    { version: 1, script: path.join(__dirname, 'scripts/001_initial_setup.sql') },
  ];

  for (let { version, script } of SQLVersions) {
    if (version > currentVersion) {
      try {
        const scriptContent = fs.readFileSync(script, 'utf-8');
        await db.query(scriptContent);
        await db.query('INSERT INTO db_versions (version, description) VALUES (?, ?)', [version, `Migration v${version}`]);
        console.log(`Migration v${version} appliquée avec succès.`);
      } catch (error) {
        console.error(`Échec de l'application de la migration v${version} :`, error);
        break;
      }
    }
  }
}

module.exports = {applyMigrations, db};
