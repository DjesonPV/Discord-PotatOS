// DEPENDANCES
import {Client, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton} from "discord.js";
import {Intents} from "discord.js";

// REQUIRE FOR DYNAMIC JSON IMPORT only used for botToken
import {createRequire} from "module";
const require = createRequire(import.meta.url);

// DISCORD BOT COMMANDS
import * as Commands from "./Commands.mjs";
import * as ButtonInteractions from "./ButtonInteractions.mjs";
import {MP3Files, MP3Path} from "./voice/MP3Files.mjs";
import {playMP3} from "./voice/Voice.mjs";

// BOT RESSOURCES

const cmdSign = '§';
const errorIcon = `https://cdn.discordapp.com/attachments/329613279204999170/970413892792623204/Error_icon.png`;

/* 
##
##  BOT STARTUP
##
*/

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
        client.on("ready", async () => {
            if (!client.user || !client.application) {
                return;
            }
    
            console.log(`${client.user.username} est en ligne`);
            
            exploreChannels();
            console.log(`${channelsText.size} cannaux textuels et ${channelsVoice.size} cannaux vocaux trouvés`);

            resolve();
        });

        const secret = require("../secret.json");
        client.login(secret.botToken);
        //client.login((await import("../secret.json", { assert: { type: "json" }})).botToken);

        client.once('ready', () => {

            client.guilds.cache.forEach(guild => {
              if (guild.me.voice) guild.me.voice.disconnect();

            });

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

/* 
##
##  MESSAGE HANDLING FOR COMMANDS
##
*/

client.on('messageCreate', messageHandler);
/**
 * Handle a new `msg` starting with the character used as
 * command identifier, to call the wanted PotatOS command
 * @param msg Represents a message on Discord
 */
function messageHandler(msg){
    if (msg.author.bot) {
        if (msg.content==="§§") msg.delete();
        else return;
    }
    if (!msg.content.startsWith(cmdSign)) return;

    msg.delete().then(() => {
            let args = msg.content.substring(1).split(/\s+/g);
            
            let cmdName = args.shift();
            let command = Commands[cmdName];
            let mp3play = MP3Files[cmdName];

            if (command) command(args, msg);
            else if (mp3play) playMP3(msg, `${MP3Path}${mp3play.file}`, mp3play.volume);
            else printAlertOnChannel(msg.channel, `La commande [ ${cmdSign}${cmdName} ] est invalide`, 10);            

        }
    ).catch(console.log);

}


/* 
##
##  INTERACTION HANDLING FOR COMMANDS
##
*/

client.on('interactionCreate', interactionHandler);

function interactionHandler(itr){ 
    
    if (itr.message && (itr.message.author === client.user)){
    let itrName = itr.customId;

    if (itr.isButton()){
        let buttonInteraction = ButtonInteractions[itrName];
        if (buttonInteraction) buttonInteraction(itr);
        else itr.deferUpdate();//replyAlertOnInterarction(itr, `Ce bouton [ ${itrName} ] n'est pas géré`);

    }
    if (itr.isSelectMenu()){
        itr.deferUpdate();
    }

    
}}

/* 
##
##  MESSAGE REPLIES AND PRINT COMMANDS
##
*/

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param text Content to send `String`
 * @param embeds Content to send `MessageEmbed`
 * @param attachments Content to send `MessageAttachement`
 * @param components Content to send `MessageActionRow`
 * @param time Time the message will be displayed (in seconds)
 */
function printOnChannel(chnl, text="", embeds=[], url = "", components=[], time = 0){
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

        let timeRow;

        if (time >0) {//embeds.push(timeEmbed);
            timeRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
                    .setCustomId('deleteNotif')
					.setLabel(`Ce message s'autodétruira dans ${time} secondes`)
					.setStyle('SECONDARY')
                    .setEmoji('🚮')
			);
        
        }

        let toSend = {};
        if (text.length   != 0) toSend.content = text;
        if (embeds.length != 0) toSend.embeds  = embeds;
        if (url.length  != 0) toSend.files   = [{attachment : url}];
        if ((components.length != 0) || timeRow) toSend.components = [...components, timeRow];

        

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
    printOnChannel(chnl,txt,[],[],[],[],time);
}

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param embed MessageEmbed to send
 * @param time Time the message will be displayed (in seconds)
 */
export function printEmbedOnChannel(chnl, embed, time){
    if(embed instanceof MessageEmbed)
    printOnChannel(chnl,[],[embed],[],[],time);
}

/**
 * 
 * @param chnl Represent a Discord TextChannel
 * @param url URL link to the picture to display
 * @param time Time the message will be displayed (in seconds)
 */
export function printLinkOnChannel(chnl, url, time){
    if (isItAnHTTPURL(url)){
        printOnChannel(chnl,[],[],url,[],time);
    }    
}

export function isItAnHTTPURL(text){
    if(typeof text == "string"){
        if (text.match(/^(https?|http):\/\/([a-zA-Z0-9\-]{1,64}\.){0,}([a-zA-Z0-9\-]{2,63})(\.(xn--)?[a-zA-Z0-9]{2,})(\:[0-9]{1,5})?\/([^\s]*)?$/)){
        return true;    
        }
    }
    return false;
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
        iconURL : errorIcon,
    });

    printEmbedOnChannel(chnl, alertEmbed, time);
}

/* 
##
##  INTERACTION REPLY
##
*/

 export function replyAlertOnInterarction(itr, txt){
    let reply = {};
    
    let alertEmbed = new MessageEmbed()
    .setColor('#FF006E')
    .setAuthor({
        name: `${txt}`,
        iconURL : errorIcon,
    });

    reply.embeds = [alertEmbed];
    reply.ephemeral = true;

   itr.reply(reply);
}
