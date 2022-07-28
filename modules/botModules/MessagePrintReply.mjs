import * as DiscordJs                   from "discord.js";
import ExploreChannels                  from "../botModules/ExploreChannels.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";

const errorIcon = `https://cdn.discordapp.com/attachments/329613279204999170/970413892792623204/Error_icon.png`;

/* 
#
#  MESSAGE REPLIES AND PRINT COMMANDS
#
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
    if (chnl == ExploreChannels.text.get(chnl.name)){

        time = Math.min(180, time);

        function deleteResponse(msg){
            if (time > 0){
                setTimeout(
                    () => {
                        MessageSafeDelete.deleteMessage(msg);
                    },
                    time * 1000);
            }
        };

        let timeRow;

        if (time >0) {//embeds.push(timeEmbed);
            timeRow = new DiscordJs.ActionRowBuilder()
			.addComponents(
				new DiscordJs.ButtonBuilder()
                    .setCustomId('deleteNotif')
					.setLabel(`Ce message s'autodétruira dans ${time} secondes`)  //##LANG : This message will be deleted in x secondes
					.setStyle(DiscordJs.ButtonStyle.Secondary)
                    .setEmoji('🚮')
			);
        
        }

        let toSend = {};
        if (text.length   != 0) toSend.content = text;
        if (embeds.length != 0) toSend.embeds  = embeds;
        if (url.length  != 0) toSend.files   = [{attachment : url}];
        if ((components.length != 0) || timeRow) toSend.components = [...components, timeRow];

        

        sendOnChannel(chnl, toSend).then(deleteResponse).catch(console.log);

    }
}

export function sendOnChannel(chnl, messageObject){
    if (chnl == ExploreChannels.text.get(chnl.name)){
    return chnl.send(messageObject);
    }
    else {
        console.log(`Ce TextChannel [${chnl.name}] de la Guild [${chnl.guild.name}] n'est pas géré !!`)  //##LANG : The [channelName] textChannel of [guildName] Guild is not supported !!
        return;
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
    if(embed instanceof DiscordJs.EmbedBuilder)
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
    let alertEmbed = new DiscordJs.EmbedBuilder()
    .setColor('#FF006E')
    .setAuthor({
        name: `${txt}`,
        iconURL : errorIcon,
    });

    printEmbedOnChannel(chnl, alertEmbed, time);
}

/* 
#
#  INTERACTION REPLY
#
*/

export function replyAlertOnInterarction(itr, txt){
    let reply = {};
    
    let alertEmbed = new DiscordJs.EmbedBuilder()
    .setColor('#FF006E')
    .setAuthor({
        name: `${txt}`,
        iconURL : errorIcon,
    });

    reply.embeds = [alertEmbed];
    reply.ephemeral = true;

   itr.reply(reply);
}

export function replyToAnInteraction(interaction, message, time = 0){

    function deleteResponse(msg){
        if (time > 0){
            setTimeout(
                () => {
                    MessageSafeDelete.deleteMessage(msg);
                },
                time * 1000);
        }
    };

    let timeRow;

    if (time >0) {
        timeRow = new DiscordJs.ActionRowBuilder()
        .addComponents(
            new DiscordJs.ButtonBuilder()
                .setCustomId('deleteNotif')
                .setLabel(`Ce message s'autodétruira dans ${time} secondes`)  //##LANG : This message will be deleted in x secondes
                .setStyle(DiscordJs.ButtonStyle.Secondary)
                .setEmoji('🚮')
        );
    
    }

    let toSend = {};
    if (message.length   != 0) toSend.content = message;
    if (timeRow) toSend.components = [timeRow];
    toSend.fetchReply = true;

    interaction.reply(toSend).then(deleteResponse).catch(console.log);

}
