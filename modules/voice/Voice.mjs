import * as DiscordJsVoice              from '@discordjs/voice';
import * as DiscordJs                   from 'discord.js';

import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import Track                            from "./Track.mjs";
import MusicSubscription                from "./MusicSubscription.mjs";
import displayMusicDisplayer            from '../botModules/MusicDisplayer.mjs';
import * as LANG from "../Language.mjs";

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
export async function streamVoice(interaction, url, volume){

    let subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription) subscription = await connectVoice(interaction);

    if (!subscription) {
        return;
    }

    try{
        const track = await Track.fetchData(url, {
            onStart(){
                displayMusicDisplayer(subscription.message.channel ?? interaction.channel);
            },
            onFinish(){
               if(subscription.queue.length === 0) subscription.destroy();
            },
            onError(error){
                console.warn(error);
                MessagePrintReply.printAlertOnChannel(interaction.channel, LANG.ERROR_TRACK(error), 10);
            }
        });

        track.setVolume(volume);

        if (track.metadata.isFile) subscription.enskip(track);
        else subscription.enqueue(track);

        displayMusicDisplayer(interaction.channel);

    } catch (error){
        console.warn(error);
        MessagePrintReply.printAlertOnChannel(interaction.channel, LANG.ERROR_PLAY_TRACK, 10);
    }

}

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
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
            MessagePrintReply.printAlertOnChannel(interaction.channel, LANG.ERROR_VOICECHANNEL_CONNECTION, 10);
            return;
        }
    }

    return subscription;

}


