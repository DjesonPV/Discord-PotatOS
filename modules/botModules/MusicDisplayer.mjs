import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";
import * as LANG from "../Language.mjs";

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
        } else if (views[2] > 0){
            num = views[2];
            dec = Math.floor(views[1]/1e2);

            if (num > 10) dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_MILLION;
        } else if (views[1] > 0){
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

function dateToString(timestamp){
    let date = new Date(timestamp);

    let day   = date.getUTCDate();
    let month = date.getUTCMonth();
    let year  = date.getUTCFullYear();

   return LANG.DATE_TEXT_FORMAT(year, month, day);
}

function YYYYMMDDToString(yyyymmdd){

    let [year, month, day] = yyyymmdd.match(/(\d{4})(\d{2})(\d{2})/).slice(1,4);

    return LANG.DATE_TEXT_FORMAT(year.replace(/^0+/, ''), (month.replace(/^0+/, ''))-1, day.replace(/^0+/, ''));
}


//***************************************** */

export default function displayMusicDisplayer(channel){

    let sub = MusicSubscription.getSubscription(channel.guild.id);

    if (!sub){
        return false;
    }

    if((sub.currentTrack.metadata.isFile === true) && (!sub.message) && (sub.queue.length === 0)){
        return;
    }

    let musicDisplayer = (sub.message)?updateMusicDisplayer(sub):updateMusicDisplayer(sub,true);

    if (musicDisplayer)
    MessagePrintReply.sendOnChannel(channel, musicDisplayer)
        .then((msg) => {
            sub.setMessage(msg)
        })
    ;

}

function updateMusicDisplayer(sub, isLoading = false){

    const musicDisplayer = buildMusicDisplayer(sub, isLoading);

    if (sub.message) {
        if (!MessageSafeDelete.isMessageMine(sub.message))
        return false;

        sub.message.edit(musicDisplayer).then((msg) => {
            sub.setMessage(msg)});
        return false;
    }

    return musicDisplayer;
}

function buildMusicDisplayer(sub, isLoading){

    // Build the Music Player
    const displayerEmbed = isLoading?constructLoadingEmbed(sub):constructDisplayerEmbed(sub);
    const playlistRow = constructPlaylistRow([sub.currentTrack,...sub.queue]);

    let messageContent = {};

    const buttonActionRow = new DiscordJs.ActionRowBuilder()
    .addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayer')
        .setLabel(LANG.MUSICDISPLAYER_NAME)
        .setStyle(DiscordJs.ButtonStyle.Secondary)
        .setEmoji('🎧')
    ).addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerPlayPause')
        .setLabel(`${sub.isPaused()?LANG.MUSICDISPLAYER_PLAY:LANG.MUSICDISPLAYER_PAUSE}`)
        .setStyle(`${sub.isPaused()?DiscordJs.ButtonStyle.Success:DiscordJs.ButtonStyle.Secondary}`)
        .setEmoji(`${sub.isPaused()?'▶':'⏸'}`)
        .setDisabled(isLoading)
    ).addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerSkip')
        .setLabel(LANG.MUSICDISPLAYER_SKIP)
        .setStyle(DiscordJs.ButtonStyle.Primary)
        //.setStyle(`${sub.queue.length>0?DiscordJs.ButtonStyle.Primary:DiscordJs.ButtonStyle.Danger}`)
        .setEmoji('⏭')
    ).addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerStop')
        .setLabel(LANG.MUSICDISPLAYER_STOP)
        .setStyle(DiscordJs.ButtonStyle.Danger)
        .setEmoji('◻')
        .setDisabled(sub.queue.length>0?false:true)
    );

        messageContent.embeds = [displayerEmbed];
        messageContent.components = [buttonActionRow];
        if (sub.queue.length > 0) messageContent.components.unshift(playlistRow);
       

    return messageContent;
}

function constructDisplayerEmbed(sub){

    const displayerEmbed = new DiscordJs.EmbedBuilder();
    
    if (!sub.currentTrack){
        return false;
    }
    
    let metadata = sub.currentTrack.metadata;

    let data = dataToDisplay(metadata);

    displayerEmbed
        .setColor(data.color)
        .setTitle(data.title)
        .setDescription(data.description)
        .setAuthor(data.author)
        .setThumbnail(data.thumbnail ?? LANG.MUSICDISPLAYER_DEFAULT_THUMBNAIL)
        .setFooter({text : `__________________________________________\nPotatOS • ${sub.guildName} > ${sub.voiceChannel.name}`,});
    ;

    if (data.url) displayerEmbed.setURL(data.url);

    return displayerEmbed;
}

function constructPlaylistRow(trackList){

    let options = [];

    trackList.forEach((track, i) => {
        const data = dataToDisplay(track.metadata);
        let option = {
            label : (`${data.playlistTitle}`).substring(0, 100),
            description : (`${data.playlistDesc}`).substring(0, 100),
            value : `${i}`,
            emoji : emojiForPlaylist(i),
        };

        options.push(option);
    });

    let playlistRow = new DiscordJs.ActionRowBuilder()
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

function dataToDisplay(metadata){
    let data = {};

    

   if(metadata.isYoutube){
        
        //`#${color[0].toString(16).padStart(2,'0').toUpperCase()}${color[1].toString(16).padStart(2,'0').toUpperCase()}${color[2].toString(16).padStart(2,'0').toUpperCase()}`;
        data.color = '#FFB46B';
        data.title = `${metadata.title}`;
        data.description = `${durationToString(metadata.duration)} • ${viewsToString(metadata.viewCount)} • ${YYYYMMDDToString(metadata.uploadDate)}`;
        data.author = {
            name : `${metadata.author}`,
            iconURL : `${metadata.authorPicture}`,
            url : `${metadata.authorURL}`,
        };
        data.url = `${metadata.videoURL}`;
        data.thumbnail = `${metadata.videoThumbnail}`;

        data.playlistTitle = data.title;
        data.playlistDesc = `${metadata.author} • ${data.description}`;

    }else if (metadata.isFile){
        data.color = LANG.MUSICDISPLAYER_BOT_COLOR;
        data.title = `${metadata.title}`;
        data.description = `${metadata.description}`;
        data.author = {
            name : LANG.MUSICDISPLAYER_COMMAND_CALLED_SOUND(metadata.key),
            iconURL : LANG.MUSICDISPLAYER_BOT_ICON,
        };

        data.playlistTitle = `${metadata.key}`;
        data.playlistDesc = LANG.MUSICDISPLAYER_THROUGH_COMMAND;

    }else {
        data.color = LANG.MUSICDISPLAYER_WEB_COLOR;
        data.title = `${metadata.file}`;
        data.description = LANG.MUSICDISPLAYER_WEB_LINK;
        data.author = {
            name : `${metadata.source}`,
            url : `https://${metadata.source}`,
            iconURL : LANG.MUSICDISPLAYER_WEB_ICON, 
        }
        data.url = `${metadata.url}`;

        data.playlistTitle = data.title;
        data.playlistDesc = data.url;
    }

    return data;
}

function emojiForPlaylist(i){    
    const emojis = ['🎶', '⏭', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[i] ?? '#️⃣';
}

function constructLoadingEmbed(sub){
    const loadingEmbed = new DiscordJs.EmbedBuilder();

    loadingEmbed
        .setColor(LANG.MUSICDISPLAYER_BOT_COLOR)
        .setTitle(LANG.MUSICDISPLAYER_LOADING)
        .setDescription(LANG.MUSICDISPLAYER_LOADING_ASCII_ART)
        .setAuthor({
            name : LANG.BOT_NAME,
            iconURL : LANG.BOT_ICON,
        })
        .setFooter({text : `__________________________________________\n${LANG.BOT_NAME} • ${sub.guildName} > ${sub.voiceChannel.name}`,});
    ;

    return loadingEmbed;
}
