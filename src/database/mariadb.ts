import mariadb from 'mariadb';

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

if (!host)
    throw new Error('DB_HOST is not defined');
if (!port)
    throw new Error('DB_PORT is not defined');
if (!user)
    throw new Error('DB_USER is not defined');
if (!password)
    throw new Error('DB_PASSWORD is not defined');
if (!database)
    throw new Error('DB_NAME is not defined');

export const db = mariadb.createPool({
    host,
    port: parseInt(port),
    user,
    password,
    database,
    connectionLimit: 5,
});