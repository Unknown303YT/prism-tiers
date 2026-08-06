import { ServerRepository } from "../repositories/ServerRepository.js";


export class ServerService {
    private readonly repository = new ServerRepository();


    public async setup(guildId: string, name: string) {
        const existing = await this.repository.getByDiscordId(guildId);

        if (existing) {
            return existing;
        }

        return await this.repository.create(guildId,name);
    }

    public async completeSetup(id: string) {
        return this.repository.completeSetup(id);
    }
}