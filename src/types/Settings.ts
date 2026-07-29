export interface BotSettings {

    roles: {

        [name: string]: string;

    };


    tierRoles: {

        [tier: string]: string;

    };


    channels: {

        [name: string]: string;

    };

}