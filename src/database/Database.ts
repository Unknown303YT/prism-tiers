import { db } from "./mariadb.js";
import { QueryBuilder } from "./QueryBuilder.js";

export class Database {
    public from(table: string) {
        return new QueryBuilder(table);
    }

    public async query(sql: string, params: unknown[] = []): Promise<unknown[]> {
        return db.query(sql, params);
    }
}

export const database = new Database();