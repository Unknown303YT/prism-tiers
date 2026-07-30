import { SettingsRepository } from "../repositories/SettingsRepository.js";

export class SettingsService {

    private readonly repository = new SettingsRepository();

    public roles: Record<string, string> = {};

    public tierRoles: Record<string, string> = {};

    public channels: Record<string, string> = {};

    public async load(): Promise<void> {

        [
            this.roles,
            this.tierRoles,
            this.channels
        ] = await Promise.all([
            this.repository.getRoles(),
            this.repository.getTierRoles(),
            this.repository.getChannels()
        ]);

    }

}