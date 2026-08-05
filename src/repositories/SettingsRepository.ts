import { BaseRepository } from "./BaseRepository.js";

export class SettingsRepository extends BaseRepository {

    public async getRoles(): Promise<Record<string, Record<string, Record<string, string>>>> {

        const { data, error } = await this.db
            .from("server_roles")
            .select("server_id, type, key, discord_role_id");

        if (error) {
            throw error;
        }

        const roles: Record<string, Record<string, Record<string, string>>> = {};

        for (const row of data) {

            roles[row.server_id] ??= {};
            roles[row.server_id][row.type] ??= {};

            roles[row.server_id][row.type][row.key] = row.discord_role_id;

        }

        return roles;

    }


    public async getChannels(): Promise<Record<string, Record<string, string>>> {

        const { data, error } = await this.db
            .from("server_channels")
            .select("server_id, key, discord_channel_id");

        if (error) {
            throw error;
        }


        const channels: Record<string, Record<string, string>> = {};

        for (const row of data) {

            channels[row.server_id] ??= {};

            channels[row.server_id][row.key] = row.discord_channel_id;

        }

        return channels;

    }

}