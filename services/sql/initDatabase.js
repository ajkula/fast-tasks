const fs = require('fs').promises;
const { Pool } = require('pg');
const path = require('path');
const logule = require('../../services/logger');

/**
 * Établit la connexion avec la base de données PostgreSQL en utilisant la bibliothèque pg.
 *
 * Les paramètres de connexion sont récupérés à partir des variables d'environnement ou des valeurs par défaut sont utilisées.
 * Utilise le module logule pour initialiser le logging.
 */
const db = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'password',
  database: process.env.PG_DATABASE || 'fast_tasks',
  port: process.env.PG_PORT || 5432,
});

/**
 * Récupère la version actuelle de la base de données.
 * 
 * Effectue une requête SQL pour obtenir la version maximale dans la table db_versions.
 * Si une erreur se produit pendant la requête, log l'erreur et retourne 0.
 * 
 * @returns {Promise<number>} - La version actuelle de la base de données, ou 0 en cas d'erreur.
 */
async function getCurrentDbVersion() {
  try {
    const res = await db.query('SELECT MAX(version) as version FROM db_versions');
    return res.rows[0].version || 0;
  } catch (error) {
    logule.error('Error while requesting Database version.');
    return 0;
  }
}

async function createDatabase() {
  try {
    // load and execute database script
    const scriptContent = await fs.readFile(path.join(__dirname, 'scripts/000_create_database.sql'), 'utf-8');
    await db.query(scriptContent);
    logule.debug('Database successfully created.');
  } catch (error) {
    if (error.message.includes('already exists')) {
      logule.warn('Database already exists.');
    } else {
      logule.error('Error during Database creation.');
    }
  }
}

/**
 * Applique les migrations de la base de données en fonction de la version actuelle de la base de données.
 *
 * 1. Obtient la version actuelle de la base de données.
 * 2. Définit les scripts de migration qui doivent être appliqués avec leurs versions respectives.
 * 3. Itère sur les scripts de migration et, si la version du script est supérieure à la version actuelle de la base de données, applique le script.
 * 4. Si le script est appliqué avec succès, insère un enregistrement dans la table db_versions avec la version et la description du script appliqué.
 * 5. Logue les résultats des tentatives d'application des scripts, que ce soit un succès ou un échec.
 *
 * @returns {Promise<void>} - Une promesse qui se résout une fois toutes les migrations nécessaires appliquées, ou rejette si une erreur se produit.
 */
async function applyMigrations() {
  try {
    await db.query('SELECT 1 FROM fast_tasks LIMIT 1');
  } catch (error) {
    if (error.message.includes('does not exist')) {
      await createDatabase();
    }
  }

  const currentVersion = await getCurrentDbVersion();
  const SQLVersions = [
    { version: 1, script: path.join(__dirname, 'scripts/001_initial_setup.sql') },
  ];

  for (let { version, script } of SQLVersions) {
    if (version > currentVersion) {
      try {
        const scriptContent = await fs.readFile(script, 'utf-8');
        await db.query(scriptContent);
        await db.query('INSERT INTO db_versions (version, description) VALUES ($1, $2)', [version, `Migration v${version}`]);
        logule.debug(`Migration v${version} successfully applied.`);
      } catch (error) {
        logule.error(`Migration application failure v${version}`);
        break;
      }
    }
  }
}

module.exports = { applyMigrations, db, getCurrentDbVersion, createDatabase };
