-- Creates a MySQL database for Task Bot

CREATE DATABASE IF NOT EXISTS tb_dev_db;
CREATE USER IF NOT EXISTS 'tb_dev'@'localhost' IDENTIFIED BY 'tb_dev_pwd';
GRANT ALL PRIVILEGES ON `tb_dev_db`.* TO 'tb_dev'@'localhost';
GRANT SELECT ON `performance_schema`.* TO 'tb_dev'@'localhost';
FLUSH PRIVILEGES;
