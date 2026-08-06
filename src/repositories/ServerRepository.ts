import { BaseRepository } from "./BaseRepository.js";


export class ServerRepository extends BaseRepository {
    public async getByDiscordId(discordGuildId: string) {
        const { data, error } = await this.db
            .from("servers")
            .select("*")
            .eq("discord_guild_id", discordGuildId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        return data;
    }



    public async create(discordGuildId: string, name: string) {
        const { data, error } = await this.db
            .from("servers")
            .insert({

                discord_guild_id: discordGuildId,
                name,
                setup_complete: false

            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    public async completeSetup(id: string) {

        const { data, error } = await this.db
            .from("servers")
            .update({
                setup_complete: true
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    public async isSetupComplete(serverId: string) {
        const { data } = await this.db
            .from("servers")
            .select("setup_complete")
            .eq("id", serverId)
            .single();

        return data?.setup_complete ?? false;
    }
}