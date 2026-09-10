import mariadb from 'mariadb';
import fs from 'node:fs/promises';
import path from 'node:path';

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

const dbPort = parseInt(port, 10);

export const db = mariadb.createPool({
    host,
    port: dbPort,
    user,
    password,
    database,
    connectionLimit: 5,
    multipleStatements: true
});

export async function initializeDatabase() {

    const connection = await mariadb.createConnection({
        host,
        port: dbPort,
        user,
        password,
        multipleStatements: true
    });

    try {
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${database}\`
             CHARACTER SET utf8mb4
             COLLATE utf8mb4_unicode_ci`
        );
    } finally {
        await connection.end();
    }


    const schemaPath = path.resolve(
        process.cwd(),
        'src/database/schema.sql'
    );

    const schema = await fs.readFile(
        schemaPath,
        'utf8'
    );

    const schemaConnection = await db.getConnection();

    try {
        await schemaConnection.query(schema);

        console.log('Database schema applied successfully.');
    } finally {
        schemaConnection.release();
    }
}


export async function closeDatabase() {

    await db.end();

}