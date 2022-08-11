import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "./MessagePrintReply.mjs";
import MusicSubscription                from "./voice/MusicSubscription.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as ButtonInteractions          from "../botCommands/ButtonInteractions.mjs";
import * as SelectMenuInteractions      from "../botCommands/SelectMenuInteractions.mjs";
import * as UTILS from './Utils.mjs';
import * as LANG from "../Language.mjs";
import favcolor from "favcolor";
import Track from "./voice/Track.mjs";

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
        (subscription?.currentTrack.metadata.type === Track.Types.File) && 
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
    // Fetch coulour in less than half a second of use default
    const colour = (metadata.type === Track.Types.YoutubeDL || metadata.type === Track.Types.WebLink) ? 
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
        })
    : LANG.MUSICDISPLAYER_BOT_COLOR;

    switch (metadata.type) {
        case Track.Types.YoutubeDL:
            return {
                color          : `${colour}`,
                title          : `${metadata.title}`,
                description    : `${metadata.isLive?`🔴 LIVE`:UTILS.durationToString(metadata.duration)} • ${UTILS.viewsToString(metadata.viewCount)} • ${UTILS.YYYYMMDDToString(metadata.uploadDate)}`,
                author : {
                    name    : `${metadata.author}`,
                    iconURL : `${metadata.favicon}`,
                    url     : `${metadata.authorURL}`,
                },
                url            : `${metadata.url}`,
                thumbnail      : `${metadata.thumbnail}`,
            };

        case Track.Types.MP3File: 
            return {
                color          : LANG.MUSICDISPLAYER_BOT_COLOR,
                title          : `${metadata.title}`,
                description    : `${metadata.description}`,
                author : {
                    name    : LANG.MUSICDISPLAYER_COMMAND_CALLED_SOUND(metadata.key),
                    iconURL : LANG.MUSICDISPLAYER_BOT_ICON,
                },
            };

        case Track.Types.Radio: 
            return {
                color          : LANG.MUSICDISPLAYER_RADIO_COLOR,
                title          : `${metadata.name}`,
                description    : `${metadata.place}, ${metadata.country}`,
                author : {
                    name    : `Radio Garden`,
                    url     : `${metadata.url}`,
                    iconURL : LANG.MUSICDISPLAYER_RADIO_ICON,
                },
                url            : `${metadata.website}`,
                thumbnail      : LANG.MUSICDISPLAYER_RADIO_THUMBNAIL,
            };

        case Track.Types.WebLink:
            return {
                color          : `${colour}`,
                title          : `${metadata.file}`,
                description    : LANG.MUSICDISPLAYER_WEB_LINK,
                author : {
                    name    : `${metadata.source}`,
                    url     : `https://${metadata.source}`,
                    iconURL : `${metadata.favicon}`, 
                },
                url        : `${metadata.url}`,
            };
    
        default:
            return {
                color: LANG.MUSICDISPLAYER_BOT_COLOR,
                title: LANG.MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_TITLE,
                description: LANG.MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_DESC,
                author: {
                    name: LANG.BOT_NAME,
                    iconURL: LANG.BOT_ICON,
                },
                thumbnail: LANG.ERROR_ICON,
            };
    }
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
