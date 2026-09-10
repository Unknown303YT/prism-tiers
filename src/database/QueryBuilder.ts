import { db } from "./mariadb.js";

export class QueryBuilder {

    private readonly table: string;

    private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";

    private columns = "*";

    private values: Record<string, unknown> | Record<string, unknown>[] = {};

    private conditions: {
        column: string;
        value: unknown;
    }[] = [];

    private shouldReturn = false;

    private shouldReturnSingle = false;

    private limitValue?: number;

    constructor(table: string) {
        this.table = table;
    }

    public select(columns = "*") {
        this.operation = "select";

        if (columns === "*") {
            this.columns = columns;
        } else {
            this.columns = columns
                .split(",")
                .map(column => `\`${column.trim()}\``)
                .join(", ");
        }

        this.shouldReturn = true;

        return this;
    }

    public insert(values: Record<string, unknown> | Record<string, unknown>[]) {
        this.operation = "insert";
        this.values = values;

        return this;
    }

    public update(values: Record<string, unknown>) {
        this.operation = "update";
        this.values = values;

        return this;
    }

    public delete() {
        this.operation = "delete";

        return this;
    }

    public upsert(values: Record<string, unknown> | Record<string, unknown>[]) {
        this.operation = "upsert";
        this.values = values;

        return this;
    }

    public eq(column: string, value: unknown) {
        this.conditions.push({
            column,
            value
        });

        return this;
    }

    public single() {
        this.shouldReturnSingle = true;

        return this.execute();
    }

    public then<TResult1 = any, TResult2 = never>(
        onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ) {
        return this.execute().then(onfulfilled, onrejected);
    }

    public limit(amount: number) {
        if (!Number.isInteger(amount) || amount < 1) {
            throw new Error("Limit must be a positive integer.");
        }

        this.limitValue = amount;

        return this;
    }

    private async execute() {
        try {
            switch (this.operation) {
                case "select":
                    return await this.executeSelect();

                case "insert":
                    return await this.executeInsert();

                case "update":
                    return await this.executeUpdate();

                case "delete":
                    return await this.executeDelete();

                case "upsert":
                    return await this.executeUpsert();
            }
        } catch (error) {
            return {
                data: null,
                error
            };
        }
    }

    private buildWhere() {
        if (this.conditions.length === 0) {
            return {
                sql: "",
                parameters: []
            };
        }

        const sql = " WHERE " + this.conditions
            .map(condition => `\`${condition.column}\` = ?`)
            .join(" AND ");

        const parameters = this.conditions.map(
            condition => condition.value
        );

        return {
            sql,
            parameters
        };
    }

    private async executeSelect() {
        const where = this.buildWhere();

        const limit = this.limitValue ? ` LIMIT ${this.limitValue}` : "";

        const rows = await db.query(
            `SELECT ${this.columns} FROM \`${this.table}\`${where.sql}${limit}`,
            where.parameters
        );

        if (this.shouldReturnSingle) {
            if (rows.length === 0) {
                return {
                    data: null,
                    error: {
                        code: "NOT_FOUND"
                    }
                };
            }

            return {
                data: rows[0],
                error: null
            };
        }

        return {
            data: rows,
            error: null
        };
    }

    private async executeInsert() {
        const values = Array.isArray(this.values)
            ? this.values
            : [this.values];

        if (values.length === 0) {
            throw new Error("Cannot insert empty values.");
        }

        const columns = Object.keys(values[0]);

        const columnSql = columns
            .map(column => `\`${column}\``)
            .join(", ");

        const placeholders = columns
            .map(() => "?")
            .join(", ");

        const parameters = values.flatMap(value =>
            columns.map(column => value[column])
        );

        const sql = `
            INSERT INTO \`${this.table}\`
            (${columnSql})
            VALUES ${values.map(() => `(${placeholders})`).join(", ")}
        `;

        const result = await db.query(sql, parameters);

        if (!this.shouldReturn) {
            return {
                data: result,
                error: null
            };
        }

        if (columns.includes("id")) {
            const ids = values
                .map(value => value.id)
                .filter(id => id !== undefined);

            if (ids.length === values.length) {
                const rows = await db.query(
                    `SELECT * FROM \`${this.table}\`
                     WHERE id IN (${ids.map(() => "?").join(", ")})`,
                    ids
                );

                return {
                    data: this.shouldReturnSingle ? rows[0] : rows,
                    error: null
                };
            }
        }

        return {
            data: null,
            error: {
                code: "RETURN_FAILED"
            }
        };
    }

    private async executeUpdate() {
        const values = this.values as Record<string, unknown>;

        const columns = Object.keys(values);

        if (columns.length === 0) {
            throw new Error("Cannot update with empty values.");
        }

        const setSql = columns
            .map(column => `\`${column}\` = ?`)
            .join(", ");

        const parameters = columns.map(
            column => values[column]
        );

        const where = this.buildWhere();

        const result = await db.query(
            `UPDATE \`${this.table}\`
             SET ${setSql}
             ${where.sql}`,
            [...parameters, ...where.parameters]
        );

        if (!this.shouldReturn) {
            return {
                data: result,
                error: null
            };
        }

        const rows = await db.query(
            `SELECT * FROM \`${this.table}\`${where.sql}`,
            where.parameters
        );

        if (this.shouldReturnSingle) {
            if (rows.length === 0) {
                return {
                    data: null,
                    error: {
                        code: "NOT_FOUND"
                    }
                };
        }

            return {
                data: rows[0],
                error: null
            };
        }

        return {
            data: rows,
            error: null
        };
    }

    private async executeDelete() {
        const where = this.buildWhere();

        const result = await db.query(
            `DELETE FROM \`${this.table}\`${where.sql}`,
            where.parameters
        );

        return {
            data: result,
            error: null
        };
    }

    private async executeUpsert() {
        const values = Array.isArray(this.values)
            ? this.values
            : [this.values];

        if (values.length === 0) {
            throw new Error("Cannot upsert empty values.");
        }

        const columns = Object.keys(values[0]);

        const columnSql = columns
            .map(column => `\`${column}\``)
            .join(", ");

        const placeholders = columns
            .map(() => "?")
            .join(", ");

        const updateSql = columns
            .map(column => `\`${column}\` = VALUES(\`${column}\`)`)
            .join(", ");

        const parameters = values.flatMap(value =>
            columns.map(column => value[column])
        );

        const sql = `
            INSERT INTO \`${this.table}\`
            (${columnSql})
            VALUES ${values.map(() => `(${placeholders})`).join(", ")}
            ON DUPLICATE KEY UPDATE
            ${updateSql}
        `;

        await db.query(sql, parameters);

        if (!this.shouldReturn) {
            return {
                data: null,
                error: null
            };
        }

        const where = this.buildWhere();

        if (where.sql) {
            const rows = await db.query(
                `SELECT * FROM \`${this.table}\`${where.sql}`,
                where.parameters
            );

            if (this.shouldReturnSingle) {
                if (rows.length === 0) {
                    return {
                        data: null,
                        error: {
                            code: "NOT_FOUND"
                        }
                    };
                }

                return {
                    data: rows[0],
                    error: null
                };
            }

            return {
                data: rows,
                error: null
            };
        }

        return {
            data: null,
            error: {
                code: "RETURN_FAILED"
            }
        };
    }

    private async getInsertedRows(result: any, count: number) {
        if (!result.insertId) {
            return [];
        }

        const firstId = Number(result.insertId);

        const rows = await db.query(
            `SELECT * FROM \`${this.table}\`
             WHERE id >= ?
             ORDER BY id ASC
             LIMIT ?`,
            [firstId, count]
        );

        return rows;
    }

}