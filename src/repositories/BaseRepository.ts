import { database } from "../database/Database.js";

export abstract class BaseRepository {
    protected readonly db = database;
}