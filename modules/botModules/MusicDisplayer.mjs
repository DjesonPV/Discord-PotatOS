import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as LANG from "../Language.mjs";
import favcolor from "favcolor";

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// DISPLAY MUSIC DISPLAYER

/** @param {DiscordJs.GuildTextBasedChannel} channel*/
export default function displayMusicDisplayer(channel){

    let subscription = MusicSubscription.getSubscription(channel.guild.id);

    if( 
        !subscription ||
        (
            (subscription.currentTrack.metadata.isFile === true) && 
            (!subscription.message) &&
            (subscription.queue.length === 0)
        ) 
    ) {
        return;
    }
    
    if (subscription.message && MessageSafeDelete.isMessageMine(subscription.message)) {
        MusicDiplayerMessagePayload(subscription)
            .then((toSend) => {
                return subscription.message.edit(toSend);
            })
            .then((message) => {
                subscription.setMessage(message);
            })
        ;
    }
    else {
        const toSend = WaitingMessagePayload(subscription);

        MessagePrintReply.sendOnChannel(channel, toSend)
            .then((message) => {
                subscription.setMessage(message);
            })
        ;
    }

}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// MUSIC DISPLAYER MESSAGE PAYLOAD

/** @param {MusicSubscription} subscription */
async function MusicDiplayerMessagePayload(subscription) {

    const musicPlayerEmbed = await displayerEmbed(subscription);
    const musicPlayerPlaylistRow = musicPlayerPlaylist([subscription.currentTrack,...subscription.queue]);
    const musicPlayerButtonsRow = musicPlayerButtons(subscription);

    const messagePayload = {embeds : [musicPlayerEmbed], components: [musicPlayerButtonsRow]};
    if (subscription.queue.length > 0) messagePayload.components.unshift(musicPlayerPlaylistRow);

    return messagePayload;
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

    const buttonActionRow = new DiscordJs.ActionRowBuilder()
    .addComponents(
        new DiscordJs.ButtonBuilder()
            .setCustomId('PotatOSMusicPlayer')
            .setLabel(LANG.MUSICDISPLAYER_NAME)
            .setStyle(DiscordJs.ButtonStyle.Secondary)
            .setEmoji('🎧')
        ,
        new DiscordJs.ButtonBuilder()
            .setCustomId('PotatOSMusicPlayerPlayPause')
            .setLabel(`${subscription.isPaused()?LANG.MUSICDISPLAYER_PLAY:LANG.MUSICDISPLAYER_PAUSE}`)
            .setStyle(`${subscription.isPaused()?DiscordJs.ButtonStyle.Success:DiscordJs.ButtonStyle.Secondary}`)
            .setEmoji(`${subscription.isPaused()?'▶':'⏸'}`)
            .setDisabled(isLoading)
        ,
        new DiscordJs.ButtonBuilder()
            .setCustomId('PotatOSMusicPlayerSkip')
            .setLabel(LANG.MUSICDISPLAYER_SKIP)
            .setStyle(DiscordJs.ButtonStyle.Primary)
            //.setStyle(`${subscription.queue.length>0?DiscordJs.ButtonStyle.Primary:DiscordJs.ButtonStyle.Danger}`)
            .setEmoji('⏭')
        ,
        new DiscordJs.ButtonBuilder()
            .setCustomId('PotatOSMusicPlayerStop')
            .setLabel(LANG.MUSICDISPLAYER_STOP)
            .setStyle(DiscordJs.ButtonStyle.Danger)
            .setEmoji('◻')
            .setDisabled(subscription.queue.length>0?false:true)
        ,
    );

    return buttonActionRow;
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
            playlistDescription = `${track.metadata.author} • ${durationToString(track.metadata.duration)} • ${viewsToString(track.metadata.viewCount)} • ${YYYYMMDDToString(track.metadata.uploadDate)}`;
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
        new DiscordJs.SelectMenuBuilder()
            .setCustomId('PotatOSMusicPlayerPlaylist')
            .setPlaceholder(LANG.MUSICDISPLAYER_SHOW_PLAYLIST(trackList.length-1))
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(options)
        ,
    );

    return playlistRow;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

async function dataToDisplay(metadata){
    let data = {};

    if(metadata.isYoutube) {
        const color = (await favcolor.fromSiteFavicon(
            metadata.videoURL.match(/(?:http|https):\/\/(?:[^\/])+\//)[0]
        )).toHex();

        data.color          = `${color}`;
        data.title          = `${metadata.title}`;
        data.description    = `${durationToString(metadata.duration)} • ${viewsToString(metadata.viewCount)} • ${YYYYMMDDToString(metadata.uploadDate)}`;
        data.author = {
            name    : `${metadata.author}`,
            iconURL : `${metadata.authorPicture}`,
            url     : `${metadata.authorURL}`,
        };
        data.url            = `${metadata.videoURL}`;
        data.thumbnail      = `${metadata.videoThumbnail}`;

    } else if (metadata.isFile) {
        data.color          = LANG.MUSICDISPLAYER_BOT_COLOR;
        data.title          = `${metadata.title}`;
        data.description    = `${metadata.description}`;
        data.author = {
            name    : LANG.MUSICDISPLAYER_COMMAND_CALLED_SOUND(metadata.key),
            iconURL : LANG.MUSICDISPLAYER_BOT_ICON,
        };

    } else {
        data.color          = LANG.MUSICDISPLAYER_WEB_COLOR;
        data.title          = `${metadata.file}`;
        data.description    = LANG.MUSICDISPLAYER_WEB_LINK;
        data.author = {
            name    : `${metadata.source}`,
            url     : `https://${metadata.source}`,
            iconURL : LANG.MUSICDISPLAYER_WEB_ICON, 
        };
        data.url        = `${metadata.url}`;
    }

    return data;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
// LOADING MESSAGE PAYLOAD

/** @param {MusicSubscription} subscription */
function WaitingMessagePayload(subscription){

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
