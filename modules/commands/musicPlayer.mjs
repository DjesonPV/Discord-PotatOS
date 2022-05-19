import {MessageEmbed} from "discord.js";
import {MusicSubscription} from "../voice/MusicSubscription.mjs";
import {streamVoice} from "../voice/Voice.mjs";
import {printEmbedOnChannel, isItAnHTTPURL} from "../Bot.mjs";

// ________________________________________________________________
// Track Display
export function current(args, msg){
    if (!msg.member.voice.channel) return;
    
    const subscription = MusicSubscription.getSubscription(msg.guild.id);
    
    if (subscription){
        const playerEmbed = new MessageEmbed();
        const data = subscription.currentTrack.metadata;

        if (data.isYoutube){
            playerEmbed
                .setColor('#FF0000')
                .setTitle(data.title)
                .setURL(data.videoURL)
                .setDescription(`${durationToString(data.duration)} • ${viewsToString(data.viewCount)} • ${dateToString(data.uploadDate)}`)
                .setAuthor({
                    name : data.author,
                    iconURL : data.authorPicture,
                    url : data.authorURL,
                })
                .setThumbnail(data.videoThumbnail)
            ;
        }
        else if (data.isFile){
            playerEmbed
                .setColor('#FFB46B')
                .setAuthor({
                    name : `Appelé avec la commande [${data.key}]`,
                    iconURL : "https://media.discordapp.net/attachments/329613279204999170/970392014296338432/PotatOS_logo.png",
                })
                .setTitle(`${data.title}`)
                .setDescription(`${data.description}`)
            ;
        }else {
            playerEmbed
                .setColor('#20B6E7')
                .setTitle(data.file)
                .setAuthor({
                    name : `${data.source}`,
                    url : `https://${data.source}`,
                    iconURL : "https://media.discordapp.net/attachments/329613279204999170/975538715223003176/logoWWW.png", 
                })
                .setURL(data.url)
                .setDescription(`Lien Internet`)
            ;
        }

        playerEmbed
            .setFooter({
                text : `__________________________________________\nPotatOS • ${msg.guild.name} > ${msg.member.voice.channel.name}`,
            })
        ;

        printEmbedOnChannel(msg.channel, playerEmbed, 20);
    }
}


export function skip(args, msg){
    if (!msg.member.voice.channel) return;

    const subscription = MusicSubscription.getSubscription(msg.guild.id);
    if (subscription) subscription.audioPlayer.stop();
}

export function stop(args, msg){
    if (!msg.member.voice.channel) return;

    const subscription = MusicSubscription.getSubscription(msg.guild.id);
    if (subscription) subscription.destroy();
}

export function play(args, msg){
    if (!msg.member.voice.channel) return;

    if (isItAnHTTPURL(args[0])){
        streamVoice(msg, args[0], 0.2);
    } else {
       // YOUTUBE SEARCH
    }

}

//_________________________________________________________________

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

        suf = " Md de";
    } else if (views[2] > 0){
        num = views[2];
        dec = Math.floor(views[1]/1e2);

        if (num > 10) dec = false;
        suf = " M de";
    } else if (views[1] > 0){
        num = views[1];
        dec = Math.floor(views[0]/1e2);

        if (num > 10) dec = false;
        suf = " k";
    } else {
        num = views[0];
        dec = false;
        suf = "";
    }



    let string = `${num}`;
    if (dec !== false) string+=`,${dec}`;
    string+=`${suf} vues`;
    return string;
}

function dateToString(timestamp){
    let date = new Date(timestamp);

    const months = [
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

    let string = `${day} ${months[month]} ${year}`;
    return string;
}


