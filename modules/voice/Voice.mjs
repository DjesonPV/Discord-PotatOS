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
    if (!msg.member.voice.channel){
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



function createSubcription(msg){
    let subscription = new MusicSubscription(msg.member.voice.channel);
    subscription.voiceConnection.on('error', console.warn);
    subscriptions.set(msg.guildId, subscription);
    return subscriptions.get(msg.guildId);
}


import {durationToString, viewsToString} from "./valueToString.mjs"


// Track Display
export function current(args, msg){
    const subscription = getSubscription(msg);
    if (subscription && msg.member.voice.channel){
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


// Mini Track Display
export function mini(args, msg){
    const subscription = getSubscription(msg);
    if (subscription && msg.member.voice.channel){
        const data = subscription.currentTrack.metadata;
        if (data){
            const customEmbed = new MessageEmbed()
                .setColor('#FF0000')
                /*.setAuthor({
                    name : data.title,
                    //iconURL : data.videoThumbnail,
                    url : data.videoURL,
                })*/
                .setTimestamp(data.uploadDate)
                //.setThumbnail(data.videoThumbnail)
                .setFooter({
                    text : `${data.author}\n${data.title}\n${durationToString(data.duration)} • ${viewsToString(data.viewCount)}`,
                    iconURL : "https://cdn.discordapp.com/attachments/329613279204999170/972624319819698237/youtubelogo.png",
                })
            
            printEmbedOnChannel(msg.channel, customEmbed, 20);
        }
    }

}


export function skip(args, msg){
    const subscription = getSubscription(msg);

    if (subscription && msg.member.voice.channel){
        subscription.audioPlayer.stop();
    }
}

export async function stop(args, msg){
    const subscription = getSubscription(msg);

    if (subscription && msg.member.voice.channel){
        if (subscription.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) await subscription.voiceConnection.destroy();
        subscription.stop();
        subscriptions.delete(msg.guildId);
    }

}

export async function play(args, msg){

    const url = args[0];

    let subscription = getNewSubscription(msg);

    if (!subscription) {
        return;
    }

    if (subscription.voiceConnection.state.status !== VoiceConnectionStatus.Ready){
        try{
            await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
        } catch (error) {
            console.warn(error);
            printAlertOnChannel(msg.channel, `Je n'ai pas réussi à me connecter, reessaie plus tard !`, 10);
            return;
        }
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


