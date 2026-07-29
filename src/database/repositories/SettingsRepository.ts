import { supabase } from "../supabase.js";

interface RoleConfig {
    name: string;
    id: string;
}

interface ChannelConfig {
    name: string;
    id: string;
}

export class SettingsRepository {


    async getRoles() {

        const { data, error } =
            await supabase
                .from("discord_roles")
                .select("*");


        if (error)
            throw error;


        return Object.fromEntries(
            data.map(role => [
                role.name,
                role.role_id
            ])
        );

    }



    async getTierRoles() {

        const { data, error } =
            await supabase
                .from("tier_roles")
                .select("*");


        if (error)
            throw error;


        return Object.fromEntries(
            data.map(role => [
                role.tier,
                role.role_id
            ])
        );

    }



    async getChannels() {

        const { data, error } =
            await supabase
                .from("discord_channels")
                .select("*");


        if (error)
            throw error;


        return Object.fromEntries(
            data.map(channel => [
                channel.name,
                channel.channel_id
            ])
        );

    }

}