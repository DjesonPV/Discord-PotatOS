
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import * as DiscordJs               from 'discord.js';
import * as SlashCommands           from "./SlashCommands.mjs";
import * as ContextMenuCommands     from "./ContextMenuCommands.mjs";
import * as ButtonInteractions      from "./ButtonInteractions.mjs";
import * as SlashCommandsUpdate     from "./botModules/UpdateCommands.mjs";
import * as LANG                    from "./Language.mjs";

import ExploreChannels      from "./botModules/ExploreChannels.mjs";
import MessageSafeDelete    from './botModules/MessageSafeDelete.mjs';


/* ______________________________ 
#
#  BOT CLIENT STARTUP DEFINITION
#  ______________________________ 
*/
const client = new DiscordJs.Client({
    intents: [
        DiscordJs.GatewayIntentBits.Guilds,
        DiscordJs.GatewayIntentBits.GuildMessages,
        DiscordJs.GatewayIntentBits.GuildMessageReactions,
        DiscordJs.GatewayIntentBits.GuildVoiceStates,
        DiscordJs.GatewayIntentBits.MessageContent
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
            if (!client.user || !client.application) {
                return;
            }

            console.log(LANG.BOT_IS_ONLINE(client.user.username));

            ExploreChannels.explore(client);
            console.log(LANG.BOT_CHANNELS_FOUND(ExploreChannels.text.size, ExploreChannels.voice.size));

            MessageSafeDelete.botUserId = client.user.id;

            resolve();
        });

        const secret = require("../secret.json");
        client.login(secret.botToken);


        client.once('ready', async () => {

            client.guilds.cache.forEach(async (guild) => {
                const memberMe = await guild.members.fetchMe();
                if (memberMe) memberMe.voice.disconnect();
            });

            await SlashCommandsUpdate.updateSlashCommands();

            console.log(LANG.BOT_READY);
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

    if (interaction.isButton() && interaction.message && (interaction.message.author.id === client.user.id)) {
        let buttonInteraction = ButtonInteractions[interaction.customId];
        if (buttonInteraction) buttonInteraction(interaction);
        else interaction.deferUpdate();
    }
    else if (interaction.isSelectMenu()) {
        interaction.deferUpdate();
    }
    else if (interaction.isChatInputCommand()) {
        const slashCommand = Object.values(SlashCommands).find(command => command.slash.name === interaction.commandName);
        if (slashCommand) await slashCommand.command(interaction);
    }
    else if (interaction.isContextMenuCommand()){
        const contextMenuCommand = Object.values(ContextMenuCommands).find(command => command.menu.name === interaction.commandName);
        if (contextMenuCommand) await contextMenuCommand.command(interaction);
    }
}
