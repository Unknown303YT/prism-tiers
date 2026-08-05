import { BaseRepository } from "./BaseRepository.js";

export class SettingsRepository extends BaseRepository {

    public async getRoles(serverId: string): Promise<Record<string, Record<string, string>>> {

        const { data, error } = await this.db
            .from("server_roles")
            .select("type, key, discord_role_id")
            .eq("server_id", serverId);

        if (error) {
            throw error;
        }

        const roles: Record<string, Record<string, string>> = {};

        for (const row of data) {

            roles[row.type] ??= {};

            roles[row.type][row.key] = row.discord_role_id;

        }

        return roles;

    }

    public async getChannels(serverId: string): Promise<Record<string, string>> {

        const { data, error } = await this.db
            .from("server_channels")
            .select("key, discord_channel_id")
            .eq("server_id", serverId);

        if (error) {
            throw error;
        }

        return Object.fromEntries(
            data.map(channel => [
                channel.key,
                channel.discord_channel_id
            ])
        );

    }

}