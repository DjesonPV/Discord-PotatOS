import * as DiscordJs                   from "discord.js";
import ExploreChannels                  from "../botModules/ExploreChannels.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as LANG from "../Language.mjs";

// ____________________________________________________ 
//
//  MESSAGE REPLIES AND PRINT COMMANDS

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel
 * @param {string} text
 * @param {DiscordJs.EmbedBuilder[]} embeds
 * @param {string} url
 * @param {DiscordJs.AnyComponentBuilder[]} components
 * @param {number} duration
 */
 function printOnChannel(channel, text="", embeds=[], url = "", components=[], duration = 0){
    if (channel == ExploreChannels.text.get(channel.name)){

        duration = Math.min(180, duration);

        /** @param {DiscordJs.Message} message */
        function deleteResponseAfterDuration(message){
            if (duration > 0){
                setTimeout(
                    () => {
                        MessageSafeDelete.deleteMessage(message);
                    },
                    duration * 1000);
            }
        };

        const durationButtonRow = MessageSafeDelete.durationButtonActionRowBuilder(duration);

        let toSend = {};
        if (text.length   != 0) toSend.content = text;
        if (embeds.length != 0) toSend.embeds  = embeds;
        if (url.length  != 0) toSend.files   = [{attachment : url}];

        const componentsToSend = [...components];
        if (duration > 0) componentsToSend.push(durationButtonRow);
        if ((componentsToSend.length != 0)) toSend.components = componentsToSend;
        
        sendOnChannel(channel, toSend)
            .then((message) => {
                MessageSafeDelete.deleteMessageAfterDuration(message, duration);
            })
            .catch(console.log)
        ;
    }
}

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel 
 * @param {DiscordJs.MessagePayload} messagePayload 
 */
export function sendOnChannel(channel, messagePayload){
    if (channel == ExploreChannels.text.get(channel.name)){
        return channel.send(messagePayload);
    }
    else {
        return Promise.reject(LANG.MSG_CHANNEL_NOT_SUPPORTED(channel.name, channel.guild.name));
    }
}

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel
 * @param {string} text
 * @param {number} duration
 */
export function printTextOnChannel(channel, text, duration){
    if(typeof text == "string")
    printOnChannel(channel, text, [], [], [], [], duration);
}

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel
 * @param {DiscordJs.EmbedBuilder} embed
 * @param {number} duration
 */
export function printEmbedOnChannel(channel, embed, duration){
    if(embed instanceof DiscordJs.EmbedBuilder)
    printOnChannel(channel, [], [embed], [], [], duration);
}

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel
 * @param {string} url
 * @param {number} duration
 */
export function printLinkOnChannel(channel, url, duration){
    if (isItAnHTTPURL(url)){
        printOnChannel(channel, [], [], url, [], duration);
    }    
}

/** @param {string} text */
export function isItAnHTTPURL(text){
    if(typeof text == "string"){
        if (text.match(/^(https?|http):\/\/([a-zA-Z0-9\-]{1,64}\.){0,}([a-zA-Z0-9\-]{2,63})(\.(xn--)?[a-zA-Z0-9]{2,})(\:[0-9]{1,5})?\/([^\s]*)?$/)){
        return true;    
        }
    }
    return false;
}

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel
 * @param {string} text
 * @param {number} duration
 */
export function printAlertOnChannel(channel, text, duration){
    let alertEmbed = new DiscordJs.EmbedBuilder()
    .setColor('#FF006E')
    .setAuthor({
        name: `${text}`,
        iconURL : LANG.ERROR_ICON,
    });

    printEmbedOnChannel(channel, alertEmbed, duration);
}

// ___________________________________________________ 
//
//  INTERACTION REPLY

/**
 * @param {DiscordJs.CommandInteraction} interaction 
 * @param {string} text 
 */
export function replyAlertOnInterarction(interaction, text){
    let messagePayload = {};
    
    let alertEmbed = new DiscordJs.EmbedBuilder()
    .setColor('#FF006E')
    .setAuthor({
        name: `${text}`,
        iconURL : LANG.ERROR_ICON,
    });

    messagePayload.embeds = [alertEmbed];
    messagePayload.ephemeral = true;

    interaction.reply(messagePayload);
}

/**
 * @param {DiscordJs.CommandInteraction} interaction 
 * @param {string} text 
 * @param {number} duration 
 */
export function replyToAnInteraction(interaction, text, duration = 0){

    const durationButtonActionRow = MessageSafeDelete.durationButtonActionRowBuilder();

    let messagePayload = {};
    if (message.length   != 0) messagePayload.content = message;
    if (duration > 0 ) messagePayload.components = [durationButtonActionRow];
    messagePayload.fetchReply = true;

    interaction.reply(messagePayload)
        .then((message) => {
            MessageSafeDelete.deleteMessageAfterDuration(message, duration);
        })
        .catch(console.log)
    ;
}
