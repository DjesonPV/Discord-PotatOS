import * as DiscordJs                   from "discord.js";
import ExploreChannels                  from "../botModules/ExploreChannels.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as LANG from "../Language.mjs";

// ____________________________________________________ 
//
//  MESSAGE REPLIES AND PRINT COMMANDS

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel
 * @param {DiscordJs.MessageOptions | string} messageOptions
 * @param {number} duration
 */
export async function printOnChannel(channel, messageOptions, duration = 0){
    if (channel == ExploreChannels.text.get(channel.name)){

        duration = Math.min(180, duration);

        if (typeof(messageOptions) === 'string') {
            messageOptions = {content: messageOptions}
        };

        const durationButtonRow = MessageSafeDelete.durationButtonActionRowBuilder(duration);

        if (duration > 0) messageOptions.components?.unshift(durationButtonRow) ?? [durationButtonRow];
        
        return await sendOnChannel(channel, messageOptions)
            .then((message) => {
                MessageSafeDelete.deleteMessageAfterDuration(message, duration);
                return message;
            })
        ;
    }
}

/**
 * @param {DiscordJs.BaseGuildTextChannel} channel 
 * @param {DiscordJs.MessageOptions} messageOptions
 */
function sendOnChannel(channel, messageOptions){
    if (channel == ExploreChannels.text.get(channel.name)){
        return channel.send(messageOptions);
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
export function printAlertOnChannel(channel, text, duration){
    printOnChannel(channel, getAlertMessageOptions(text), duration);
}

// ___________________________________________________ 
//
//  INTERACTION REPLY

/**
 * @param {DiscordJs.CommandInteraction} interaction 
 * @param {string} text 
 */
export function replyAlertOnInterarction(interaction, text){
    let messageOptions = getAlertMessageOptions(text);
    messageOptions.ephemeral = true;
    
    if (interaction.replied) {
        interaction.followUp(messageOptions);
    }
    else {
        interaction.reply(messageOptions);
    }
}

/**
 * @param {string} text 
 * @returns {DiscordJs.MessageOptions}
 */
export function getAlertMessageOptions(text){
    return {
        embeds: [
        new DiscordJs.EmbedBuilder()
            .setColor('#FF006E')
            .setAuthor({
                name: `${text}`,
                iconURL : LANG.ERROR_ICON,
            })
        ,
        ],
    };
}

/**
 * @param {DiscordJs.CommandInteraction} interaction 
 * @param {string} text 
 * @param {number} duration 
 */
export function replyToAnInteraction(interaction, text, duration = 0){

    const durationButtonActionRow = MessageSafeDelete.durationButtonActionRowBuilder();

    /** @type {DiscordJs.MessageOptions} */
    let messageOptions = {
        fetchReply: true,
    };
    if (text.length   != 0) messageOptions.content = text;
    if (duration > 0 ) messageOptions.components = [durationButtonActionRow];

    interaction.reply(messageOptions)
        .then((message) => {
            MessageSafeDelete.deleteMessageAfterDuration(message, duration);
        })
        .catch(console.log)
    ;
}


