import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "./MessagePrintReply.mjs";
import MusicSubscription                from "./voice/MusicSubscription.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as ButtonInteractions          from "../botCommands/ButtonInteractions.mjs";
import * as SelectMenuInteractions      from "../botCommands/SelectMenuInteractions.mjs";
import * as LANG from "../Language.mjs";

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
        (subscription?.currentTrack.metadata.isLocalFile) && 
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
    
    const displayerEmbed = new DiscordJs.EmbedBuilder()
        .setColor(subscription.currentTrack.metadata.color)
        .setTitle(subscription.currentTrack.metadata.title)
        .setDescription(subscription.currentTrack.metadata.description)
        .setAuthor(subscription.currentTrack.metadata.author)
        .setThumbnail(subscription.currentTrack.metadata.thumbnail ?? LANG.MUSICDISPLAYER_DEFAULT_THUMBNAIL)
        .setFooter({text : LANG.MUSICDISPLAYER_FOOTER(subscription.guildName, subscription.voiceChannel.name)});
    ;

    if (subscription.currentTrack.metadata.url) displayerEmbed.setURL(subscription.currentTrack.metadata.url);

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
