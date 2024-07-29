CREATE DATABASE IF NOT EXISTS garage_db;
USE garage_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lastname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'client') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE vehicules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marque VARCHAR(255) NOT NULL,
    modele VARCHAR(255) NOT NULL,
    annee INT(11) NOT NULL,
    client_id INT,
    FOREIGN KEY (client_id) REFERENCES users(id)
);
INSERT INTO users (lastname, firstname, email, password, role)
VALUES (
        'VroumVroum',
        'Garagiste',
        'garagiste@vroumvroum.fr',
        '$2a$08$K1WDAEAfMUsXmYGQJffEXuA47ZBqAQdxglvZW2MPFvpY/zbAvwqZO',
        'admin'
    );
INSERT INTO users (lastname, firstname, email, password, role)
VALUES (
        'Elric',
        'Edward',
        'edward.elric@alchem.fma',
        '$2a$08$K1WDAEAfMUsXmYGQJffEXuA47ZBqAQdxglvZW2MPFvpY/zbAvwqZO',
        'client'
    );