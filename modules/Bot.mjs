import {Client, MessageEmbed, MessageAttachment} from "discord.js";
import {Intents} from "discord.js";
import * as Commands from "./Commands.mjs";

import {createRequire} from "module";
const require = createRequire(import.meta.url);


const cmdSign = '§';
const potatOSicon = new MessageAttachment("./assets/PotatOS_icon.png");
const errorIcon = new MessageAttachment("./assets/Error_icon.png");

const client = new Client({
    intents:[
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});


/**
 * Start the PotatOSKasatnie core and connect it to Discord with
 * the 'botToken' stored in `secret.json`
 */
export function start(){
    return new Promise((resolve) => {
        const secret = require("../secret.json");

        client.on("ready", async () => {
            if (!client.user || !client.application) {
                return;
            }
    
            console.log(`${client.user.username} est en ligne`);
            
            exploreChannels();
            console.log(`${channelsText.size} cannaux textuels et ${channelsVoice.size} cannaux vocaux trouvés`);

            resolve();
        });

        client.login(secret.botToken);

    });

}


const channelsText  = new Map();
const channelsVoice = new Map();

function exploreChannels(){
    client.channels.cache.forEach( channel => {
        if (channel.type == `GUILD_TEXT`){
            channelsText.set(channel.name, channel);
        } else
        if (channel.type === `GUILD_VOICE`){
            channelsVoice.set(channel.name, channel);
        }
    });
}

client.on('messageCreate', messageHandler);
/**
 * Handle a new `msg` starting with the character used as
 * command identifier, to call the wanted PotatOS command
 * @param msg Represents a message on Discord
 */
function messageHandler(msg){

    if (msg.content.startsWith(cmdSign)){
        msg.delete().then(() => {
                let args = msg.content.substring(1).split(/\s+/g);
                let cmdName = args[0];
                args.shift();
                let command = Commands[cmdName];

                if (command){
                    command(args, msg);
                } else {

                    let wrongCommand = new MessageEmbed()
                    .setColor('#FF006E')
                    .setAuthor({
                        name: `La commande [ ${cmdSign}${cmdName} ] est invalide`,
                        iconURL : `https://cdn.discordapp.com/attachments/329613279204999170/970413892792623204/Error_icon.png`,

                    });
                    
                    sendOnChannel(msg.channel, wrongCommand, 10);
                }
                

            }
        ).catch(console.log);
    }

}


/**
 * Write content `cnt` on the Discord channel `chnl`
 * 
 * This message can be deleted automatically 
 * after a given amount of time (up to 180 seconds), or not by 
 * setting `time` to 0
 * @param chnl Represents a channel on Discord
 * @param cnt Content you want to print, can be a text or an embed
 * @param time Time limit in seconds
 */
export function sendOnChannel(chnl, cnt, time = 0){
    if (chnl == channelsText.get(chnl.name)){
        if (typeof cnt != null){

            time = Math.min(180, time);

            function deleteResponse(msg){
                if (time > 0){
                    setTimeout(
                        () => {
                            msg.delete().catch(()=>{});
                        },
                        time * 1000);
                }
            };

            let timeEmbed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setAuthor({
                    name: `Ce message s'autodétruira dans ${time} secondes`,
                    iconURL : `https://cdn.discordapp.com/attachments/329613279204999170/970415622984966154/Delete_icon.png`,
                });

            
            let embeds = [];
            let content;

            if(typeof cnt == `string`){
                content = cnt;
            }else
            if(cnt instanceof MessageEmbed){
                embeds.push(cnt)
            }
            else{
                return false;
            }

            if (time >0) embeds.push(timeEmbed);

            

            let toSend;
            if (content) toSend = {content : content ,embeds : embeds};
            else toSend = {embeds : embeds}; 

           // console.log(toSend);

            chnl.send(toSend).then(deleteResponse).catch(console.log);

        }
    }
}



