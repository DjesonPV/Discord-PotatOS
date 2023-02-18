import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import * as DiscordJs from 'discord.js';

import * as SlashCommands from "./botCommands/SlashCommands.mjs";
import * as ButtonInteractions from "./botCommands/ButtonInteractions.mjs";
import * as ContextMenuCommands from "./botCommands/ContextMenuCommands.mjs";
import * as SelectMenuInteractions from "./botCommands/SelectMenuInteractions.mjs";

import * as LANG from "./Language.mjs";
import * as SlashCommandsUpdate from "./botModules/UpdateCommands.mjs";
import * as Tikilist from "./botModules/Tikilist.mjs";

import ExploreChannels from "./botModules/ExploreChannels.mjs";
import MessageSafeDelete from './botModules/MessageSafeDelete.mjs';


/* ______________________________ 
#
#  BOT CLIENT STARTUP DEFINITION
#  ______________________________ 
*/
const client = new DiscordJs.Client({
    intents: [
        DiscordJs.GatewayIntentBits.Guilds, // Commands
        //DiscordJs.GatewayIntentBits.GuildMessages,
        DiscordJs.GatewayIntentBits.GuildMessageReactions, // BRUH
        DiscordJs.GatewayIntentBits.GuildVoiceStates,   // Music Player
        DiscordJs.GatewayIntentBits.GuildMembers // Tikilist and Hidden VoiceChannel
        //DiscordJs.GatewayIntentBits.MessageContent
    ]
});


/* ______________________________ 
#
#  BOT START
#  ______________________________ 
*/

/**
 * Start the PotatOS core and connect it to Discord with
 * the 'botToken' stored in `secret.json`
 */
export function start() {
    return new Promise(async (resolve) => {
        client.on("ready", async () => {
            if (client?.user && client?.application) {
                console.log(LANG.botIsOnline(client.user.username));

                ExploreChannels.explore(client);
                console.log(LANG.logChannelsFound(ExploreChannels.text.size, ExploreChannels.voice.size, ExploreChannels.guilds.size));

                MessageSafeDelete.botUserId = client.user.id;

                resolve();
            }
        });

        const secret = require("../secret.json");
        client.login(secret.botToken);

        client.once('ready', async () => {
            client.guilds.cache.forEach(async (guild) => {
                const memberMe = await guild.members.fetchMe();
                if (memberMe) memberMe.voice.disconnect();
            });

            await SlashCommandsUpdate.updateSlashCommands(secret.botToken, secret.botID, secret.guildsID);
            await Tikilist.init(client, secret.guildsID['Le Tout Kastanie'], secret.usersID['Tikitik']);

            console.log(LANG.logReady);
        })
    });
}

/* ______________________________ 
#
#  INTERACTION HANDLING FOR COMMANDS
#  ______________________________ 
*/

client.on('interactionCreate', interactionHandler);

/** @param {DiscordJs.BaseInteraction} interaction*/
async function interactionHandler(interaction) {

    // DiscordJs.ButtonInteraction
    if (interaction.isButton() && isMessageFromBot(interaction.message)) {
        const buttonInteraction = Object.values(ButtonInteractions)
            .find(command => command.customId === interaction.customId)
            ;
        if (buttonInteraction) await buttonInteraction.command(interaction);
    }
    // DiscordJs.SelectMenuInteraction
    else if (interaction.isStringSelectMenu() && isMessageFromBot(interaction.message)) {
        const selectMenuInteraction = Object.values(SelectMenuInteractions)
            .find(command => command.customId === interaction.customId)
            ;
        if (selectMenuInteraction) await selectMenuInteraction.command(interaction);
    }
    // DiscordJs.ChatInputCommandInteraction a.k.a SlashCommand
    else if (interaction.isChatInputCommand()) {
        const slashCommand = Object.values(SlashCommands)
            .find(command => command.slash.name === interaction.commandName)
            ;
        if (slashCommand) await slashCommand.command(interaction);
    }
    // DiscordJs.ContextMenuCommandInteraction a.k.a RightClicCommand
    else if (interaction.isContextMenuCommand()) {
        const contextMenuCommand = Object.values(ContextMenuCommands)
            .find(command => command.menu.name === interaction.commandName)
            ;
        if (contextMenuCommand) await contextMenuCommand.command(interaction);
    }
}

function isMessageFromBot(message) {
    return message?.author.id === client.user.id;
}
