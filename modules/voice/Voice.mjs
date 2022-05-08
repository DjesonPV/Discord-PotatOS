import {
	entersState,
	VoiceConnectionStatus,
} from '@discordjs/voice';

import {Track} from "./Track.mjs";
import {MusicSubscription} from "./MusicSubscription.mjs";

import {printAlertOnChannel, printEmbedOnChannel} from "../Bot.mjs";
import {MessageEmbed} from "discord.js";

const subscriptions = new Map();


function getNewSubscription(msg){
    if (!msg.member.voice.channelId){
        printAlertOnChannel(msg.channel, `Tu dois être connecté à un channel vocal pour utiliser cette commande`, 10);
        return false;
    } else {
        let subscription = getSubscription(msg);
        if (subscription) {
            return subscription;
        } else {
            return createSubcription(msg);
        }
    }

}

function getSubscription(msg){
    if (!msg.member.voice.channelId){
        printAlertOnChannel(msg.channel, `Tu dois être connecté à un channel vocal pour utiliser cette commande`, 10);
        return false;
    } else {
        let subscription = subscriptions.get(msg.guildId);
        if (subscription) {
            return subscription;
        } else {
            return false;
        }   
    }
    
}

function removeSubscription(msg){
    subscriptions.delete(msg.guildId);
}

function createSubcription(msg){
    let subscription = new MusicSubscription(msg.member.voice.channel);
    subscription.voiceConnection.on('error', console.warn);
    subscriptions.set(msg.guildId, subscription);
    return subscriptions.get(msg.guildId);
}


export async function play(args, msg){

    const url = args[0];
    //console.log(url);

    let subscription = getNewSubscription(msg);

    if (!subscription) {
        return;
    }

    try{
        await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
    } catch (error) {
        console.warn(error);
        printAlertOnChannel(msg.channel, `Je n'ai pas réussi à me connecter, reessaie plus tard !`, 10);
        return;
    }

    try{
        const track = await Track.from(url, {
            onStart(){
               // printTextOnChannel(msg.channel, `Je joue de la musique`, 10);
            },
            onFinish(){
               if(subscription.queue.length === 0) stop(args, msg);
               // printTextOnChannel(msg.channel, `J'ai fini' la musique`, 10);
            },
            onError(error){
                console.warn(error);
                printAlertOnChannel(msg.channel, `Erreur : ${error}`, 20);
            }
        });

        subscription.enqueue(track);
        //await printTextOnChannel(msg.channel, `Ajouté **${track.title}**`, 10);

    } catch (error){
        console.warn(error);
        printAlertOnChannel(msg.channel, `J'ai pas reussi a jouer ton morceau`, 10);
    }

}


export function skip(args, msg){
    let subscription = getSubscription(msg);

    if (subscription){
        subscription.audioPlayer.stop();
        //await printTextOnChannel(msg.channel, `Morceau skipé`, 10);
    } else {
        printAlertOnChannel(msg.channel, `Je ne joue pas de musique`, 10);
    }
}

// playlist
export function current(args, msg){

    const subscription = getSubscription(msg);

    if (subscription){

        const data = subscription.currentTrack.metadata;
        if (data){

            const customEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(data.title)
                .setURL(data.videoURL)
                .setAuthor({
                    name : data.author,
                    iconURL : data.authorPicture,
                    url : data.authorURL,
                })
                .setTimestamp(data.uploadDate)
                .setThumbnail(data.videoThumbnail)
                .setFooter({
                    text : `${durationToString(data.duration)} • ${viewsToString(data.viewCount)}`,
                    iconURL : "https://cdn.discordapp.com/attachments/329613279204999170/972624319819698237/youtubelogo.png",
                })
            
            printEmbedOnChannel(msg.channel, customEmbed, 20);

        }

    }

}

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


export async function stop(args, msg){

    let subscription = getSubscription(msg);

    if (subscription){
        await subscription.voiceConnection.destroy();
        removeSubscription(msg);
        //await printTextOnChannel(msg.channel, `Ciao mon pote`, 10);
    }

}
