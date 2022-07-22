import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import MessageSafeDelete                from "./MessageSafeDelete.mjs";

function durationToString(duration){
    let seconds = duration%60;
    let minutes = (Math.floor(duration/60))%60;
    let hours   = Math.floor(duration/3600);

    let string = "";
    if (hours) string+=(`${hours}:`)
    string+=(`${((hours>0)&&(minutes<10))?'0':''}${minutes}:`)
    string+=(`${seconds<10?'0':''}${seconds}`)
    return string;
}

function viewsToString(viewCount){
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

        suf = " Md de";                 //##LANG :   x billion of (10^9)
    } else if (views[2] > 0){
        num = views[2];
        dec = Math.floor(views[1]/1e2);

        if (num > 10) dec = false;
        suf = " M de";                  //##LANG :  x millions of (10^6)
    } else if (views[1] > 0){
        num = views[1];
        dec = Math.floor(views[0]/1e2);

        if (num > 10) dec = false;
        suf = " k";                     //##LANG :  x thousands of (10^3)
    } else {
        num = views[0];
        dec = false;
        suf = "";
    }



    let string = `${num}`;
    if (dec !== false) string+=`,${dec}`;
    string+=`${suf} vues`;           //##LANG :  views
    return string;                  //##LANG string Format : x U of views // where U is a unit suffix
}

function dateToString(timestamp){
    let date = new Date(timestamp);

    const months = [    //##LANG Month of a Gregorian calendar
        "janv.",
        "févr.",
        "mars",
        "avr.",
        "mai",
        "juin",
        "juill.",
        "août",
        "sept.",
        "oct.",
        "nov.",
        "déc."
    ];
    
    let day   = date.getUTCDate();
    let month = date.getUTCMonth();
    let year  = date.getUTCFullYear();

    let string = `${day} ${months[month]} ${year}`; //##LANG : date format : DD month. YYYY
    return string;
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

    /*let musicDisplayer = false;

    if (!sub.message){

        musicDisplayer = waitDisplayer(sub)
    }
    else {
        musicDisplayer = updateMusicDisplayer(sub);
    } */

    let musicDisplayer = (sub.message)?updateMusicDisplayer(sub):updateMusicDisplayer(sub,true);

    if (musicDisplayer) MessagePrintReply.sendOnChannel(channel, musicDisplayer).then((msg) => {
        sub.setMessage(msg)});

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
        .setLabel(`PotatOS Music Player`)
        .setStyle(DiscordJs.ButtonStyle.Secondary)
        .setEmoji('🎧')
    ).addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerPlayPause')
        .setLabel(`${sub.isPaused()?"Jouer":"Pause"}`)           //##LANG Music : "Play":"Pause"
        .setStyle(`${sub.isPaused()?DiscordJs.ButtonStyle.Success:DiscordJs.ButtonStyle.Secondary}`)
        .setEmoji(`${sub.isPaused()?'▶':'⏸'}`)
        .setDisabled(isLoading)
    ).addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerSkip')
        .setLabel(`Skip`)           //##LANG Music : Skip
        .setStyle(DiscordJs.ButtonStyle.Primary)
        //.setStyle(`${sub.queue.length>0?DiscordJs.ButtonStyle.Primary:DiscordJs.ButtonStyle.Danger}`)
        .setEmoji('⏭')
    ).addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerStop')
        .setLabel(`Stop`)           //##LANG Music : Stop
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
        .setFooter({text : `__________________________________________\nPotatOS • ${sub.guildName} > ${sub.voiceChannel.name}`,});
    ;

    if (data.thumbnail) displayerEmbed.setThumbnail(data.thumbnail);
    if (data.url)       displayerEmbed.setURL(data.url);

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
            .setPlaceholder(`Afficher la playlist [${trackList.length-1}]`)     //##LANG : Show playlist [2]
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
        data.color = '#FF0000';
        data.title = `${metadata.title}`;
        data.description = `${durationToString(metadata.duration)} • ${viewsToString(metadata.viewCount)} • ${dateToString(metadata.uploadDate)}`;
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
        data.color = '#FFB46B';
        data.title = `${metadata.title}`;
        data.description = `${metadata.description}`;
        data.author = {
            name : `Appelé avec la commande [${metadata.key}]`,         //##LANG : Called with [cmdName] command
            iconURL : "https://media.discordapp.net/attachments/329613279204999170/970392014296338432/PotatOS_logo.png",
        };

        data.playlistTitle = `${metadata.key}`;
        data.playlistDesc = `Via la commande`;          //##LANG : Through the command

    }else {
        data.color = '#20B6E7';
        data.title = `${metadata.file}`;
        data.description = `Lien Internet`;         //##LANG : Internet link
        data.author = {
            name : `${metadata.source}`,
            url : `https://${metadata.source}`,
            iconURL : "https://media.discordapp.net/attachments/329613279204999170/975538715223003176/logoWWW.png", 
        }
        data.url = `${metadata.url}`;

        data.playlistTitle = data.title;
        data.playlistDesc = data.url;
    }

    return data;
}

function emojiForPlaylist(i){
    switch (i) {
        case 0:
            return '🎶';
        case 1:
            return '⏭';
        case 2:
            return '2️⃣';
        case 3:
            return '3️⃣';
        case 4:
            return '4️⃣';
        case 5:
            return '5️⃣';
        case 6:
            return '6️⃣';
        case 7:
            return '7️⃣';
        case 8:
            return '8️⃣';
        case 9:
            return '9️⃣';
        case 10:
            return '🔟';
        default:
            return '#️⃣';
    }

}

function constructLoadingEmbed(sub){
    const loadingEmbed = new DiscordJs.EmbedBuilder();

    loadingEmbed
        .setColor("#ffb46b")
        .setTitle(`C h a r g e m e n t . . .`)  //##LANG : L o a d i n g . . .
        .setDescription(`\`\`\`
                !
                |
                |    |~/
                |   _|~
  .============.|  (_|   |~/
.-;____________;|.      _|~
| [_________I__] |     (_|
|  """"" (_) (_) |
| .=====..=====. |
| |:::::||:::::| |
| '=====''=====' |
'----------------'
        \`\`\``)
        .setAuthor({
            name : `PotatOS`,
            iconURL : "https://media.discordapp.net/attachments/329613279204999170/970392014296338432/PotatOS_logo.png",
        })
        .setFooter({text : `__________________________________________\nPotatOS • ${sub.guildName} > ${sub.voiceChannel.name}`,});
    ;

    return loadingEmbed;
}
