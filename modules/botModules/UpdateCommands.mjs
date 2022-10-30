import {REST} from '@discordjs/rest';
import {Routes} from 'discord.js/node_modules/discord-api-types/v10.mjs';

import * as SlashCommands from '../botCommands/SlashCommands.mjs';
import * as ContextMenuCommands from '../botCommands/ContextMenuCommands.mjs';
import * as LANG from "../Language.mjs";

export async function updateSlashCommands(botToken, botID , guildsID) {

    const rest = new REST({ version: '10' }).setToken(botToken);

    const commandList = [];

//* Comment bloc to remove commands from API
    for (let commandName in SlashCommands){
        commandList.push(SlashCommands[commandName].slash.toJSON());
    }

    for (let commandName in ContextMenuCommands){
        commandList.push(ContextMenuCommands[commandName].menu.toJSON());
    }
//*/

    try {
        console.log(LANG.logCommandsRefreshStart);

        for (let guildName in guildsID){

            await rest.put(
                Routes.applicationGuildCommands(botID, (guildsID[guildName])),
                { body: commandList },
            );                
        };
        
        console.log(LANG.logCommandsRefreshSuccess);
    } catch (error) {
        console.error(error);
    }
}
