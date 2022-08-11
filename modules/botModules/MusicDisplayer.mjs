import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "./MessagePrintReply.mjs";
import MusicSubscription                from "./voice/MusicSubscription.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as ButtonInteractions          from "../botCommands/ButtonInteractions.mjs";
import * as SelectMenuInteractions      from "../botCommands/SelectMenuInteractions.mjs";
import * as UTILS from './Utils.mjs';
import * as LANG from "../Language.mjs";
import favcolor from "favcolor";

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// DISPLAY MUSIC DISPLAYER

/** @param {DiscordJs.GuildTextBasedChannel} channel*/
export default function displayMusicDisplayer(channel){

    const subscription = MusicSubscription.getSubscription(channel.guild.id);

    if(!isItALonelyPlaysound(subscription)) {
                
        if (MessageSafeDelete.isMessageMine(subscription.message)) {
            MusicDiplayerMessageOptions(subscription)
                .then((toSend) => {
                    return subscription.message.editable?subscription.message.edit(toSend):undefined;
                })
                .then((message) => {
                    subscription.setMessage(message);
                })
                .catch((error) => {console.log(error);})
            ;
        }
        else {
            MessagePrintReply.printOnChannel(channel, WaitingMessageOptions(subscription))
                .then((message) => {
                    subscription.setMessage(message);
                })
            ;
        }
    }

}

/** @param {MusicSubscription} subscription */
function isItALonelyPlaysound(subscription) {
    return ( // the ? provide false is there is no subscription
        (subscription?.currentTrack.metadata.isFile === true) && 
        (subscription.queue.length === 0) &&
        (!subscription.message)
    )
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// MUSIC DISPLAYER MESSAGE OPTIONS

/**  @param {MusicSubscription} subscription */
async function MusicDiplayerMessageOptions(subscription) {

    const musicPlayerEmbed = await displayerEmbed(subscription);
    const musicPlayerPlaylistRow = musicPlayerPlaylist([subscription.currentTrack,...subscription.queue]);
    const musicPlayerButtonsRow = musicPlayerButtons(subscription);

    /** @type {DiscordJs.MessageOptions} */
    const messageOptions = {embeds : [musicPlayerEmbed], components: [musicPlayerButtonsRow]};
    if (subscription.queue.length > 0) messageOptions.components.unshift(musicPlayerPlaylistRow);

    return messageOptions;
}

/** @param {MusicSubscription} subscription */
async function displayerEmbed(subscription){
    
    let metadata = subscription.currentTrack.metadata;

    let data = await dataToDisplay(metadata);

    const displayerEmbed = new DiscordJs.EmbedBuilder()
        .setColor(data.color)
        .setTitle(data.title)
        .setDescription(data.description)
        .setAuthor(data.author)
        .setThumbnail(data.thumbnail ?? LANG.MUSICDISPLAYER_DEFAULT_THUMBNAIL)
        .setFooter({text : LANG.MUSICDISPLAYER_FOOTER(subscription.guildName, subscription.voiceChannel.name)});
    ;

    if (data.url) displayerEmbed.setURL(data.url);

    return displayerEmbed;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// BUTTON ROW

/** @param {MusicSubscription} subscription */
function musicPlayerButtons(subscription, isLoading = false){
    return new DiscordJs.ActionRowBuilder()
        .addComponents(
            ButtonInteractions.musicPlayer.button,
            ButtonInteractions.musicPlayerPlayPause.button(subscription.isPaused(), subscription?.currentTrack?.metadata?.isLive, isLoading),
            ButtonInteractions.musicPlayerSkip.button(isLoading || subscription.queue.length <= 0),
            ButtonInteractions.musicPlayerStop.button(isLoading),
        )
    ;
}


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// PLAYLIST ROW

function musicPlayerPlaylist(trackList){
    return new DiscordJs.ActionRowBuilder()
        .addComponents(
            SelectMenuInteractions.musicPlayerPlaylist.selectMenu(trackList),
        )
    ;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

async function dataToDisplay(metadata){
    let data = {};

    // Fetch coulour in less than half a second of use default
    const colour = (metadata.isYoutube|| metadataIsInternet(metadata))? 
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(LANG.MUSICDISPLAYER_WEB_COLOR);
            return;
        }, 500);

        try {
            favcolor.fromSiteFavicon(metadata.url.match(/(?:http|https):\/\/(?:[^\/])+\//)[0]).then(color => {
                resolve(color.toHex());
            });
        } catch (error) {
            resolve(LANG.MUSICDISPLAYER_WEB_COLOR);
            return;
        } 
    }):LANG.MUSICDISPLAYER_BOT_COLOR;

    // If metadata were fetch by yt-dlp
    if (metadata.isYoutube) {
        data.color          = `${colour}`;
        data.title          = `${metadata.title}`;
        data.description    = `${metadata.isLive?`🔴 LIVE`:UTILS.durationToString(metadata.duration)} • ${UTILS.viewsToString(metadata.viewCount)} • ${UTILS.YYYYMMDDToString(metadata.uploadDate)}`;
        data.author = {
            name    : `${metadata.author}`,
            iconURL : `${metadata.favicon}`,
            url     : `${metadata.authorURL}`,
        };
        data.url            = `${metadata.url}`;
        data.thumbnail      = `${metadata.thumbnail}`;

    // If metadata if from PotatOS files
    } else if (metadata.isFile) {
        data.color          = LANG.MUSICDISPLAYER_BOT_COLOR;
        data.title          = `${metadata.title}`;
        data.description    = `${metadata.description}`;
        data.author = {
            name    : LANG.MUSICDISPLAYER_COMMAND_CALLED_SOUND(metadata.key),
            iconURL : LANG.MUSICDISPLAYER_BOT_ICON,
        };

    } else if (metadata.isRadio) {
        data.color          = LANG.MUSICDISPLAYER_RADIO_COLOR;
        data.title          = `${metadata.name}`;
        data.description    = `${metadata.place}, ${metadata.country}`;
        data.author = {
            name    : `Radio Garden`,
            url     : `${metadata.url}`,
            iconURL : LANG.MUSICDISPLAYER_RADIO_ICON,
        };
        data.url            = `${metadata.website}`;
        data.thumbnail      = LANG.MUSICDISPLAYER_RADIO_THUMBNAIL;

    // if it's file is from Internet and not parsed by yt-dlp
    } else {
        data.color          = `${colour}`;
        data.title          = `${metadata.file}`;
        data.description    = LANG.MUSICDISPLAYER_WEB_LINK;
        data.author = {
            name    : `${metadata.source}`,
            url     : `https://${metadata.source}`,
            iconURL : `${metadata.favicon}`, 
        };
        data.url        = `${metadata.url}`;
    }

    return data;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
// LOADING MESSAGE OPTIONS

/** 
 * @param {MusicSubscription} subscription 
 * @returns {DiscordJs.MessageOptions}
 * */
function WaitingMessageOptions(subscription){

    const loadingEmbed = new DiscordJs.EmbedBuilder()
        .setColor(LANG.MUSICDISPLAYER_BOT_COLOR)
        .setTitle(LANG.MUSICDISPLAYER_LOADING)
        .setDescription(LANG.MUSICDISPLAYER_LOADING_ASCII_ART)
        .setAuthor({
            name : LANG.BOT_NAME,
            iconURL : LANG.BOT_ICON,
        })
        .setFooter({text : LANG.MUSICDISPLAYER_FOOTER(subscription.guildName, subscription.voiceChannel.name)});
    ;

    const buttonRow = musicPlayerButtons(subscription, true);

    return {embeds: [loadingEmbed], components: [buttonRow]};
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// DATA JUGGLING

function metadataIsInternet(metadata){
    return (!metadata.isYoutube && !metadata.isFile && !metadata.isRadio);
}
