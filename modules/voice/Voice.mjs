import {
	entersState,
	VoiceConnectionStatus,
} from '@discordjs/voice';

import {Track} from "./Track.mjs";
import {MusicSubscription} from "./MusicSubscription.mjs";

import {printAlertOnChannel, printEmbedOnChannel, isItAnHTTPURL} from "../Bot.mjs";

export function skip(args, msg){
    const subscription = MusicSubscription.getSubscription(msg);

    if (subscription && msg.member.voice.channel){
        subscription.audioPlayer.stop();
    }
}

export function stop(args, msg){
    MusicSubscription.killVoice(msg);
}

export function play(args, msg){

    if (isItAnHTTPURL(args[0])){
        //console.log(`${args[0]} est valide`);
        streamVoice(msg, args[0], 0.2);
    } else {
       // console.log(`Non : ${args[0]}`);
    }

}

async function streamVoice(msg, url, volume){

    let subscription = MusicSubscription.getNewSubscription(msg);

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
        const track = await Track.fetchData(url, {
            onStart(){
               // printTextOnChannel(msg.channel, `Je joue de la musique`, 10);
            },
            onFinish(){
               if(subscription.queue.length === 0) MusicSubscription.killVoice(msg);
               // printTextOnChannel(msg.channel, `J'ai fini' la musique`, 10);
            },
            onError(error){
                console.warn(error);
                printAlertOnChannel(msg.channel, `Erreur : ${error}`, 20);
            }
        });

        track.setVolume(volume);

        if (track.metadata.isFile) subscription.enskip(track);
        else subscription.enqueue(track);

    } catch (error){
        console.warn(error);
        printAlertOnChannel(msg.channel, `J'ai pas reussi a jouer ton morceau`, 10);
    }

}


export function playMP3(msg, mp3url, mp3vol){
    streamVoice(msg, mp3url, mp3vol);
}


