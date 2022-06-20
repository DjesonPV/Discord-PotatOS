import {
	entersState,
	VoiceConnectionStatus,
} from '@discordjs/voice';

import {Track} from "./Track.mjs";
import {MusicSubscription} from "./MusicSubscription.mjs";

import {printAlertOnChannel} from "../Bot.mjs";
import { displayMusicDisplayer } from '../MusicDisplayer.mjs';

export async function streamVoice(msg, url, volume){

    let subscription = MusicSubscription.getNewSubscription(msg);

    if (!subscription) {
        return;
    }

    if (subscription.voiceConnection.state.status !== VoiceConnectionStatus.Ready){
        try{
            await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
        } catch (error) {
            console.warn(error);
            printAlertOnChannel(msg.channel, `Je n'ai pas réussi à me connecter, reessaie plus tard !`, 10);    //##LANG : Can't connect now, retry later!
            return;
        }
    }

    try{
        const track = await Track.fetchData(url, {
            onStart(){
                displayMusicDisplayer(msg.channel);
            },
            onFinish(){
               if(subscription.queue.length === 0) subscription.destroy();
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
        printAlertOnChannel(msg.channel, `J'ai pas reussi a jouer ton morceau`, 10);  //##LANG : Couldn't play your song
    }

}


export function playMP3(msg, mp3url, mp3vol){
    streamVoice(msg, mp3url, mp3vol);
}


