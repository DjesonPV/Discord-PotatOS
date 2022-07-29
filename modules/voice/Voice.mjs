import * as DiscordJsVoice              from '@discordjs/voice';

import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import Track                            from "./Track.mjs";
import MusicSubscription                from "./MusicSubscription.mjs";
import displayMusicDisplayer            from '../botModules/MusicDisplayer.mjs';




export async function streamVoice(interaction, url, volume){

    let subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription) subscription = await connectVoice(interaction);

    if (!subscription) {
        return;
    }

    try{
        const track = await Track.fetchData(url, {
            onStart(){
                displayMusicDisplayer(subscription.message.channel || interaction.channel);
            },
            onFinish(){
               if(subscription.queue.length === 0) subscription.destroy();
            },
            onError(error){
                console.warn(error);
                MessagePrintReply.printAlertOnChannel(interaction.channel, `Erreur : ${error}`, 10); //##LANG : Error: $...
            }
        });

        track.setVolume(volume);

        if (track.metadata.isFile) subscription.enskip(track);
        else subscription.enqueue(track);

        displayMusicDisplayer(interaction.channel);

    } catch (error){
        console.warn(error);
        MessagePrintReply.printAlertOnChannel(interaction.channel, `J'ai pas reussi a jouer ton morceau`, 10);  //##LANG : Couldn't play your song
    }

}

async function connectVoice(interaction){

    let subscription = MusicSubscription.getNewSubscription(interaction);

    if (!subscription) {
        console.error(`Bug in /voice/Voice.mjs/connectVoice()`);
        return;
    }

    if (subscription.voiceConnection.state.status !== DiscordJsVoice.VoiceConnectionStatus.Ready){
        try{
            await DiscordJsVoice.entersState(subscription.voiceConnection, DiscordJsVoice.VoiceConnectionStatus.Ready, 20e3);
        } catch (error) {
            console.warn(error);
            MessagePrintReply.printAlertOnChannel(interaction.channel, `Je n'ai pas réussi à me connecter, reessaie plus tard !`, 10);    //##LANG : Can't connect now, retry later!
            return;
        }
    }

    return subscription;

}


