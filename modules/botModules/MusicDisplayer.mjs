import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "./MessagePrintReply.mjs";
import MusicSubscription                from "./voice/MusicSubscription.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as ButtonInteractions          from "../botCommands/ButtonInteractions.mjs";
import * as SelectMenuInteractions      from "../botCommands/SelectMenuInteractions.mjs";
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
                .catch((error) => {;})
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
            ButtonInteractions.musicPlayerPlayPause.button(subscription.isPaused(), disablePlayPauseButton(subscription, isLoading)),
            ButtonInteractions.musicPlayerSkip.button(isLoading),
            ButtonInteractions.musicPlayerStop.button(isLoading || subscription.queue.length<=0),
        )
    ;
}

function disablePlayPauseButton(subscription, isLoading) {
    return (
        isLoading ||
        subscription?.currentTrack?.metadata?.isLive === true
    );
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// PLAYLIST ROW

function musicPlayerPlaylist(trackList){

    let options = [];
    const emojis = ['🎶', '⏭', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    trackList.forEach((track, i) => {
        
        let playlistTitle = LANG.MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_TITLE;
        let playlistDescription = LANG.MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_TITLE;

        if (track.metadata.isYoutube){
            playlistTitle = `${track.metadata.title}`;
            playlistDescription = `${track.metadata.author} • ${track.metadata.isLive?`⬤ LIVE`:durationToString(track.metadata.duration)} • ${viewsToString(track.metadata.viewCount)} • ${YYYYMMDDToString(track.metadata.uploadDate)}`;
        }
        else if (track.metadata.isFile){
            playlistTitle = `${track.metadata.key}`;
            playlistDescription = LANG.MUSICDISPLAYER_THROUGH_COMMAND;
        }
        else {
            playlistTitle = `${track.metadata.file}`;
            playlistDescription = `${track.metadata.url}`
        }

        let option = {
            label : (`${playlistTitle}`).substring(0, 100),
            description : (`${playlistDescription}`).substring(0, 100),
            value : `${i}`,
            emoji : emojis[i] ?? '#️⃣',
        };

        options.push(option);
    });

    const playlistRow = new DiscordJs.ActionRowBuilder()
    .addComponents(
        SelectMenuInteractions.musicPlayerPlaylist.selectMenu(options, trackList.length-1),
    );

    return playlistRow;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

async function dataToDisplay(metadata){
    let data = {};

    // Fetch coulour in less than half a second of use default
    const colour = await new Promise((resolve) => {
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
    });

    // If metadata were fetch by yt-dlp
    if (metadata.isYoutube) {
        data.color          = `${colour}`;
        data.title          = `${metadata.title}`;
        data.description    = `${metadata.isLive?`🔴 LIVE`:durationToString(metadata.duration)} • ${viewsToString(metadata.viewCount)} • ${YYYYMMDDToString(metadata.uploadDate)}`;
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

/** @param {number} duration */
function durationToString(duration){
    let seconds = Math.floor(duration%60);
    let minutes = (Math.floor(duration/60))%60;
    let hours   = Math.floor(duration/3600);

    let string = "";
    if (hours) string+=(`${hours}:`)
    string+=(`${((hours>0)&&(minutes<10))?'0':''}${minutes}:`)
    string+=(`${seconds<10?'0':''}${seconds}`)
    return string;
}

/** @param {number} viewCount */
function viewsToString(viewCount){
    let string;
    if (viewCount){
        let views = [
            viewCount % 1e3,
            (Math.floor(viewCount/1e3))%1e3,
            (Math.floor(viewCount/1e6))%1e3,
            (Math.floor(viewCount/1e9)),
        ];

        let num = 0;
        let dec = 0;
        let suf = "";

        if(views[3] > 0) {
            num = views[3];
            dec = Math.floor(views[2]/1e2);

            if (num > 10) dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_BILLION;
        } else if (views[2] > 0) {
            num = views[2];
            dec = Math.floor(views[1]/1e2);

            if (num > 10) dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_MILLION;
        } else if (views[1] > 0) {
            num = views[1];
            dec = Math.floor(views[0]/1e2);

            if (num > 10) dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_THOUSAND;
        } else {
            num = views[0];
            dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_UNIT;
        }

        string = `${num}`;
        if (dec !== false) string+=`,${dec}`;
        string+=`${suf}`;
    } else string = LANG.MUSICDISPLAYER_VIEWS_UNKNOWN;

    return string;
}

/** @param {string} yyyymmdd */
function YYYYMMDDToString(yyyymmdd){

    let [year, month, day] = yyyymmdd.match(/(\d{4})(\d{2})(\d{2})/).slice(1,4);

    return LANG.DATE_TEXT_FORMAT(year.replace(/^0+/, ''), (month.replace(/^0+/, ''))-1, day.replace(/^0+/, ''));
}
