DROP DATABASE IF EXISTS auth_database;
CREATE DATABASE auth_database;
USE auth_database;

CREATE TABLE login_info (
	username VARCHAR(30),
    password VARCHAR(45),
    avgSpeed0 float(10),
    avgSpeed1 float(10),
    avgSpeed2 float(10)
);