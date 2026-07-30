import { BaseRepository } from "./BaseRepository.js";

export class SettingsRepository extends BaseRepository {

    public async getRoles(): Promise<Record<string, string>> {

        const { data, error } = await this.db
            .from("discord_roles")
            .select("name, role_id");

        if (error) {
            throw error;
        }

        return Object.fromEntries(
            data.map(role => [
                role.name,
                role.role_id
            ])
        );

    }

    public async getTierRoles(): Promise<Record<string, string>> {

        const { data, error } = await this.db
            .from("tier_roles")
            .select("tier, role_id");

        if (error) {
            throw error;
        }

        return Object.fromEntries(
            data.map(role => [
                role.tier,
                role.role_id
            ])
        );

    }

    public async getChannels(): Promise<Record<string, string>> {

        const { data, error } = await this.db
            .from("discord_channels")
            .select("name, channel_id");

        if (error) {
            throw error;
        }

        return Object.fromEntries(
            data.map(channel => [
                channel.name,
                channel.channel_id
            ])
        );

    }

}