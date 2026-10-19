-- Run as a MySQL administrator after replacing CHANGE_THIS_DATABASE_PASSWORD.
-- Use MySQL 8.0.16+ (enforced CHECK constraints); MySQL 8.4 is suitable.
CREATE DATABASE IF NOT EXISTS electrohub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'electrohub'@'localhost' IDENTIFIED BY 'CHANGE_THIS_DATABASE_PASSWORD';
GRANT ALL PRIVILEGES ON electrohub.* TO 'electrohub'@'localhost';
-- Spring Flyway creates and versions the application tables on startup.
-- Existing MySQL users retain their previous password; CREATE USER IF NOT EXISTS does not reset it.
