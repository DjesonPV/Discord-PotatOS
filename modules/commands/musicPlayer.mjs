import {MusicSubscription} from "../voice/MusicSubscription.mjs";
import {streamVoice} from "../voice/Voice.mjs";
import {printEmbedOnChannel, isItAnHTTPURL} from "../Bot.mjs";
import { displayMusicDisplayer } from "../MusicDisplayer.mjs";

// ________________________________________________________________
// Track Display

export function skip(args, msg){
    if (!msg.member.voice.channel) return;

    const subscription = MusicSubscription.getSubscription(msg.guild.id);
    if (subscription) subscription.skip();
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