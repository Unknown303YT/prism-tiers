import { BaseRepository } from "./BaseRepository.js";


export class ServerRepository extends BaseRepository {


    public async getByDiscordId(
        discordGuildId: string
    ) {

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



    public async create(
        discordGuildId: string,
        name: string
    ) {

        const { data, error } = await this.db
            .from("servers")
            .insert({

                discord_guild_id: discordGuildId,
                name

            })
            .select()
            .single();


        if (error) {
            throw error;
        }


        return data;

    }


}