import { BaseRepository } from "./BaseRepository.js";

export class RoleRepository extends BaseRepository {
    public async create(serverId: string, type: string, key: string, roleId: string) {
        const { data, error } = await this.db
            .from("server_roles")
            .upsert({
                server_id: serverId,
                type,
                key,
                discord_role_id: roleId
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}