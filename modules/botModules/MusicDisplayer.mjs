import * as DiscordJs                   from "discord.js";
import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";

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

    let musicDisplayer = false;

    if (!sub.message){

        musicDisplayer = waitDisplayer(sub)
    }
    else {
        musicDisplayer = updateMusicDisplayer(sub);
    } 

    if (musicDisplayer) MessagePrintReply.sendOnChannel(channel, musicDisplayer).then((msg) => {
        sub.setMessage(msg)});

}

function updateMusicDisplayer(sub){

    const musicDisplayer = buildMusicDisplayer(sub);

    if (sub.message) {
        sub.message.edit(musicDisplayer).then((msg) => {
            sub.setMessage(msg)});
        return false;
    }

    return musicDisplayer;
}

function buildMusicDisplayer(sub){

    // Build the Music Player
    const displayerEmbed = constructDisplayerEmbed(sub);
    const playlistRow = constructPlaylistRow([sub.currentTrack,...sub.queue]);

    const buttonActionRow = new DiscordJs.MessageActionRow()
    .addComponents(
        new DiscordJs.MessageButton()
        .setCustomId('PotatOSMusicPlayer')
        .setLabel(`PotatOS Music Player`)
        .setStyle('SECONDARY')
        .setEmoji('🎧')
    ).addComponents(
        new DiscordJs.MessageButton()
        .setCustomId('PotatOSMusicPlayerSkip')
        .setLabel(`Skip`)
        .setStyle('PRIMARY')
        .setEmoji('⏭')
    ).addComponents(
        new DiscordJs.MessageButton()
        .setCustomId('PotatOSMusicPlayerStop')
        .setLabel(`Stop`)
        .setStyle('DANGER')
        .setEmoji('◻')
    );

    return {
        embeds : [displayerEmbed],
        components : [playlistRow, buttonActionRow],
    }
}

function constructDisplayerEmbed(sub){

    const displayerEmbed = new DiscordJs.MessageEmbed();
    
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
            label : `${data.playlistTitle}`,
            description : `${data.playlistDesc}`,
            value : `${i}`,
            emoji : emojiForPlaylist(i),
            default : i==0?true:false,
        };

        options.push(option);
    });

    let playlistRow = new DiscordJs.MessageActionRow()
    .addComponents(
        new DiscordJs.MessageSelectMenu()
            .setCustomId('PotatOSMusicPlayerPlaylist')
            .setPlaceholder("Playlist")
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

function waitDisplayer(sub){
    const displayerEmbed = new DiscordJs.MessageEmbed();

    displayerEmbed
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

    const buttonActionRow = new DiscordJs.MessageActionRow()
    .addComponents(
        new DiscordJs.MessageButton()
        .setCustomId('PotatOSMusicPlayer')
        .setLabel(`PotatOS Music Player`)
        .setStyle('SECONDARY')
        .setEmoji('🎧')
    );

    return {embeds : [displayerEmbed], components : [buttonActionRow]};
}
