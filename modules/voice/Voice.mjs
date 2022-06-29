import * as DiscordJsVoice              from '@discordjs/voice';

import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import Track                            from "./Track.mjs";
import MusicSubscription                from "./MusicSubscription.mjs";
import displayMusicDisplayer            from '../botModules/MusicDisplayer.mjs';




export async function streamVoice(msg, url, volume){

    let subscription = MusicSubscription.getSubscription(msg.guild.id);
    if (!subscription) subscription = await connectVoice(msg);

    if (!subscription) {
        return;
    }

    try{
        const track = await Track.fetchData(url, {
            onStart(){
                displayMusicDisplayer(subscription.message.channel || msg.channel);
            },
            onFinish(){
               if(subscription.queue.length === 0) subscription.destroy();
            },
            onError(error){
                console.warn(error);
                MessagePrintReply.printAlertOnChannel(msg.channel, `Erreur : ${error}`, 20);
            }
        });

        track.setVolume(volume);

        if (track.metadata.isFile) subscription.enskip(track);
        else subscription.enqueue(track);

        displayMusicDisplayer(msg.channel);

    } catch (error){
        console.warn(error);
        MessagePrintReply.printAlertOnChannel(msg.channel, `J'ai pas reussi a jouer ton morceau`, 10);  //##LANG : Couldn't play your song
    }

}

async function connectVoice(msg){

    let subscription = MusicSubscription.getNewSubscription(msg);

    if (!subscription) {
        console.error(`Bug in /voice/Voice.mjs/connectVoice()`);
        return;
    }

    if (subscription.voiceConnection.state.status !== DiscordJsVoice.VoiceConnectionStatus.Ready){
        try{
            await DiscordJsVoice.entersState(subscription.voiceConnection, DiscordJsVoice.VoiceConnectionStatus.Ready, 20e3);
        } catch (error) {
            console.warn(error);
            MessagePrintReply.printAlertOnChannel(msg.channel, `Je n'ai pas réussi à me connecter, reessaie plus tard !`, 10);    //##LANG : Can't connect now, retry later!
            return;
        }
    }

    return subscription;

}


