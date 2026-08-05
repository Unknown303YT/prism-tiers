import { SettingsRepository } from "../repositories/SettingsRepository.js";

interface ServerSettings {
    roles: Record<string, Record<string, string>>;
    channels: Record<string, string>;
}


export class SettingsService {

    private readonly repository = new SettingsRepository();


    public servers: Record<string, ServerSettings> = {};


    public async load(): Promise<void> {

        const [
            roles,
            channels
        ] = await Promise.all([
            this.repository.getRoles(),
            this.repository.getChannels()
        ]);


        const serverIds = new Set([
            ...Object.keys(roles),
            ...Object.keys(channels)
        ]);


        for (const serverId of serverIds) {

            this.servers[serverId] = {
                roles: roles[serverId] ?? {},
                channels: channels[serverId] ?? {}
            };

        }

    }


    public get(serverId: string): ServerSettings {

        return this.servers[serverId];

    }

}