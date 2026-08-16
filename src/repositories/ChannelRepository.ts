import { BaseRepository } from "./BaseRepository.js";

export class ChannelRepository extends BaseRepository {
    public async create(serverId: string, type: string, key: string, discordChannelId: string) {
        const { data, error } = await this.db
            .from("server_channels")
            .insert({
                server_id: serverId,
                type,
                key,
                discord_channel_id: discordChannelId
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    public async get(serverId: string, type: string, key: string) {
        const { data, error } = await this.db
            .from("server_channels")
            .select("*")
            .eq("server_id", serverId)
            .eq("type", type)
            .eq("key", key)
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        return data;
    }

    public async update(serverId: string, type: string, key: string, discordChannelId: string) {
        const { data, error } = await this.db
            .from("server_channels")
            .update({
                discord_channel_id: discordChannelId
            })
            .eq("server_id", serverId)
            .eq("type", type)
            .eq("key", key)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    public async delete(serverId: string, type: string, key: string) {
        const { error } = await this.db
            .from("server_channels")
            .delete()
            .eq("server_id", serverId)
            .eq("type", type)
            .eq("key", key);

        if (error) {
            throw error;
        }
    }
}