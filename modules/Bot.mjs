
import {createRequire} from 'module';
const require = createRequire(import.meta.url);

import * as DiscordJs                   from 'discord.js';
import * as Commands                    from "./Commands.mjs";
import * as ButtonInteractions          from "./ButtonInteractions.mjs";
import * as SlashCommandsUpdate         from "./botModules/SlashCommands.mjs";

import * as MessagePrintReply           from "./botModules/MessagePrintReply.mjs";
import * as MP3Files                    from "./voice/MP3Files.mjs";
import * as Voice                       from "./voice/Voice.mjs";


import ExploreChannels                  from "./botModules/ExploreChannels.mjs";
import MessageSafeDelete                from './botModules/MessageSafeDelete.mjs';

const cmdSign = '§';

/* 
#
#  BOT STARTUP
#
*/

const client = new DiscordJs.Client({
    intents:[
        DiscordJs.Intents.FLAGS.GUILDS,
        DiscordJs.Intents.FLAGS.GUILD_MESSAGES,
        DiscordJs.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        DiscordJs.Intents.FLAGS.GUILD_VOICE_STATES
    ]
});


/**
 * Start the PotatOS core and connect it to Discord with
 * the 'botToken' stored in `secret.json`
 */
export function start(){
    return new Promise(async (resolve) => {
        client.on("ready", async () => {
            if (!client.user || !client.application) {
                return;
            }
    
            console.log(`${client.user.username} est en ligne`);   //##LANG : PotatOS is online
            
            ExploreChannels.explore(client);
            console.log(`${ExploreChannels.text.size} cannaux textuels et ${ExploreChannels.voice.size} cannaux vocaux trouvés`);  //##LANG : Found x textChannels and x voiceChannels
            
            MessageSafeDelete.botUserId = client.user.id;

            resolve();
        });

        const secret = require("../secret.json");
        client.login(secret.botToken);


        client.once('ready', async () => {

            client.guilds.cache.forEach(guild => {
              if (guild.me.voice) guild.me.voice.disconnect();

            });

            await SlashCommandsUpdate.updateSlashCommands();

            console.log(`Prêt !`);  //##LANG : Ready!
        })
    });

}

/* 
#
#  MESSAGE HANDLING FOR COMMANDS
#
*/


//client.on('messageCreate', messageHandler);
/**
 * Handle a new `msg` starting with the character used as
 * command identifier, to call the wanted PotatOS command
 * @param msg Represents a message on Discord
 */
/*
function messageHandler(msg){
    if (!msg.content.startsWith(cmdSign)) return;

    MessageSafeDelete.deleteThisMessageEvenSoItSNotMine(msg).then(() => {    //##DEL
            let args = msg.content.substring(1).split(/\s+/g);
            
            let cmdName = args.shift();
            let command = Commands[cmdName];
            let mp3play = MP3Files.files[cmdName];

            if (command) command(args, msg);
            else if (mp3play) Voice.streamVoice(msg, `${MP3Files.path}${mp3play.file}`, mp3play.volume);
            else MessagePrintReply.printAlertOnChannel(msg.channel, `La commande [ ${cmdSign}${cmdName} ] est invalide`, 10);  //##LANG : Wrong command [cmd]

        }
    ).catch(console.log);

}
//*/


/* 
#
#  INTERACTION HANDLING FOR COMMANDS
#
*/

client.on('interactionCreate', interactionHandler);

async function interactionHandler(itr){ 
    
    if (itr.message && (itr.message.author === client.user)){
        let itrName = itr.customId;

        if (itr.isButton()){
            let buttonInteraction = ButtonInteractions[itrName];
            if (buttonInteraction) buttonInteraction(itr);
            else itr.deferUpdate();
            //MessagePrintReply.replyAlertOnInterarction(itr, `Ce bouton [ ${itrName} ] n'est pas géré`); //##LANG : Not handled Button [buttonID]

        }
        if (itr.isSelectMenu()){
            itr.deferUpdate();
        }    
    }
    else if (itr.isCommand()){
        await Commands[itr.commandName].command(itr);
    }

}


