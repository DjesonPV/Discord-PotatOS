
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import * as DiscordJs               from 'discord.js';
import * as Commands                from "./Commands.mjs";
import * as ButtonInteractions      from "./ButtonInteractions.mjs";
import * as SlashCommandsUpdate     from "./botModules/SlashCommands.mjs";
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

async function interactionHandler(itr) {

    if (itr.message && (itr.message.author.id === client.user.id)) {
        let itrName = itr.customId;

        if (itr.isButton()) {
            let buttonInteraction = ButtonInteractions[itrName];
            if (buttonInteraction) buttonInteraction(itr);
            else itr.deferUpdate();
        }
        if (itr.isSelectMenu()) {
            itr.deferUpdate();
        }
    }
    else if (itr.type === DiscordJs.InteractionType.ApplicationCommand) {
        const slashCommand = Object.values(Commands).find(command => command.slash.name === itr.commandName);
        if (slashCommand) await slashCommand.command(itr);
    }
}
