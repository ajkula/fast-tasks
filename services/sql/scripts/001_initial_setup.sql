-- Script : 001_initial_setup.sql

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS fast_tasks;

-- Utiliser la base de données créée ou existante
USE fast_tasks;

-- Créer la table de versionnement si elle n'existe pas
CREATE TABLE IF NOT EXISTS db_versions (
    version INT PRIMARY KEY,
    description VARCHAR(255),
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table fast_posts si elle n'existe pas
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    priority VARCHAR(50) DEFAULT 'Normal'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);