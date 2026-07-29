import type { BotSettings } from "../types/Settings.js";
import { SettingsRepository } from "../database/repositories/SettingsRepository.js";


export class SettingsService {


    private repository =
        new SettingsRepository();


    public settings!: BotSettings;



    async load() {

        this.settings = {

            roles:
                await this.repository.getRoles(),


            tierRoles:
                await this.repository.getTierRoles(),


            channels:
                await this.repository.getChannels()

        };


        console.log(
            "Settings loaded."
        );

    }


}