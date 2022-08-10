import * as DiscordJsVoice              from '@discordjs/voice';
import * as DiscordJs                   from 'discord.js';

import * as MessagePrintReply           from "../MessagePrintReply.mjs";
import Track                            from "./Track.mjs";
import MusicSubscription                from "./MusicSubscription.mjs";
import displayMusicDisplayer            from '../MusicDisplayer.mjs';
import * as LANG from "../../Language.mjs";

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
export async function streamVoice(interaction, url, volume, restartLive = false){

    let subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription) subscription = await connectVoice(interaction);

    if (!subscription) { // If there is no subscription
        return console.log(LANG.ERROR_VOICE_CONNECTION);
    }

    try{
        const track = await Track.fetchData(url, {
            async onStart(){
                displayMusicDisplayer(subscription?.message?.channel ?? interaction.channel);
                subscription.setSelfMute(false);
            },
            async onFinish(){
               if(subscription.queue.length === 0) await subscription.destroy();
               subscription.setSelfMute(true);
            },
            async onError(error){
                console.warn(error);
                MessagePrintReply.printAlertOnChannel(interaction.channel, LANG.ERROR_TRACK(error), 10);
            }
        });

        track.setVolume(volume);

        if (restartLive || track.metadata.isFile) subscription.enskip(track);
        else subscription.enqueue(track);

        displayMusicDisplayer(interaction.channel);

    } catch (error){
        MessagePrintReply.printAlertOnChannel(interaction.channel, LANG.ERROR_PLAY_TRACK, 10);
        console.error(error);
    }

}

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function connectVoice(interaction){

    let subscription = MusicSubscription.getNewSubscription(interaction);

    if (!subscription) {
        return Promise.reject(`Bug in /voice/Voice.mjs/connectVoice()`);
    }

    if (subscription.voiceConnection.state.status !== DiscordJsVoice.VoiceConnectionStatus.Ready){
        try{
            await DiscordJsVoice.entersState(subscription.voiceConnection, DiscordJsVoice.VoiceConnectionStatus.Ready, 20e3);
        } catch (error) {
            MessagePrintReply.printAlertOnChannel(interaction.channel, LANG.ERROR_VOICECHANNEL_CONNECTION, 10);
            return Promise.reject(error);
        }
    }

    return subscription;
}


