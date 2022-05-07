import {Client, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton} from "discord.js";
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
    return new Promise(async (resolve) => {
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
        //client.login((await import("../secret.json", { assert: { type: "json" }})).botToken);

        client.once('ready', () => {
            console.log(`Prêt !`);
        })

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
    if (msg.author.bot) return;
    if (!msg.content.startsWith(cmdSign)) return;

    msg.delete().then(() => {
            let args = msg.content.substring(1).split(/\s+/g);
            let cmdName = args[0];
            args.shift();
            let command = Commands[cmdName];

            if (command){
                command(args, msg);
            } else {

               /* let wrongCommand = new MessageEmbed()
                .setColor('#FF006E')
                .setAuthor({
                    name: `La commande [ ${cmdSign}${cmdName} ] est invalide`,
                    iconURL : `https://cdn.discordapp.com/attachments/329613279204999170/970413892792623204/Error_icon.png`,

                });
                
                printEmbedOnChannel(msg.channel, wrongCommand, 10);*/
                printAlertOnChannel(msg.channel, `La commande [ ${cmdSign}${cmdName} ] est invalide`, 10);
            }
            

        }
    ).catch(console.log);
    

}


client.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
    
    if (interaction.customId == 'deleteNotif'){
        interaction.message.delete();
    }
    
});

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param text Content to send `String`
 * @param embeds Content to send `MessageEmbed`
 * @param attachments Content to send `MessageAttachement`
 * @param time Time the message will be displayed (in seconds)
 */
function printOnChannel(chnl, text="", embeds=[], url = "", time = 0){
    if (chnl == channelsText.get(chnl.name)){

        time = Math.min(180, time);

        function deleteResponse(msg){
            if (time > 0){
                setTimeout(
                    () => {
                        if (msg)
                        msg.delete().catch(()=>{});
                    },
                    time * 1000);
            }
        };

       /* const timeEmbed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setAuthor({
            name: `Ce message s'autodétruira dans ${time} secondes`,
            iconURL : `https://cdn.discordapp.com/attachments/329613279204999170/970415622984966154/Delete_icon.png`,
        });*/

        let timeRow;

        if (time >0) {//embeds.push(timeEmbed);
            timeRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
                    .setCustomId('deleteNotif')
					.setLabel(`Ce message s'autodétruira dans ${time} secondes`)
					.setStyle('SECONDARY')
                    //.setDisabled(true)
                    .setEmoji('🚮')
			);
        
        }

        let toSend = {};
        if (text.length   != 0) toSend.content = text;
        if (embeds.length != 0) toSend.embeds  = embeds;
        if (url.length  != 0) toSend.files   = [{attachment : url}];
        if (timeRow) toSend.components = [timeRow];

        //console.log(toSend);

        chnl.send(toSend).then(deleteResponse).catch(console.log);

    }
}

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param txt Text to send
 * @param time Time the message will be displayed (in seconds)
 */
export function printTextOnChannel(chnl, txt, time){
    if(typeof txt == "string")
    printOnChannel(chnl,txt,[],[],time);
}

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param embed MessageEmbed to send
 * @param time Time the message will be displayed (in seconds)
 */
export function printEmbedOnChannel(chnl, embed, time){
    if(embed instanceof MessageEmbed)
    printOnChannel(chnl,[],[embed],[],time);
}

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param url URL link to the picture to display
 * @param time Time the message will be displayed (in seconds)
 */
export function printLinkOnChannel(chnl, url, time){
    if(typeof url == "string"){
        if (url.match(/^(https?|http):\/\/(-\.)?([^\s\/?\.#]+\.?)+(\/[^\s]*)?$/g)){
            //console.log(url);
            //let link = new MessageAttachment(toString(url));
            printOnChannel(chnl,[],[],url,time);
        }
    }
    
}

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param txt Text to send in the alert
 * @param time Time the alert will be displayed (in seconds)
 */
export function printAlertOnChannel(chnl, txt, time){
    let alertEmbed = new MessageEmbed()
    .setColor('#FF006E')
    .setAuthor({
        name: `${txt}`,
        iconURL : `https://cdn.discordapp.com/attachments/329613279204999170/970413892792623204/Error_icon.png`,
    });

    printEmbedOnChannel(chnl, alertEmbed, time);
}



