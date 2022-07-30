import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v10';

import {createRequire} from 'module';

import * as Commands from '../Commands.mjs';
import * as LANG from "../Language.mjs";

export async function updateSlashCommands() {
    const require = createRequire(import.meta.url);

    const secret = require("../../secret.json");

    const rest = new REST({ version: '10' }).setToken(secret.botToken);

    const slashCommands = [];

    for (let commandName in Commands){
        slashCommands.push(Commands[commandName].slash.toJSON());
    }

    try {
        console.log(LANG.SLASHCOMMANDS_REFRESH_START);

        for (let guildName in secret.guildsID){

            await rest.put(
                Routes.applicationGuildCommands(secret.botID, (secret.guildsID[guildName])),
                { body: slashCommands },
            );                
        };
        
        console.log(LANG.SLASHCOMMANDS_REFRESH_SUCCESS);
    } catch (error) {
        console.error(error);
    }
}
