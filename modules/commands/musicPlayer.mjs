import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import * as Voice                       from "../voice/Voice.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import displayMusicDisplayer            from "../botModules/MusicDisplayer.mjs";

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

    if (MessagePrintReply.isItAnHTTPURL(args[0])){
        Voice.streamVoice(msg, args[0], 0.2);
    } else {
       // YOUTUBE SEARCH
    }

}

export function pause(args, msg){
    if (!msg.member.voice.channel) return;

    const subscription = MusicSubscription.getSubscription(msg.guild.id);
    if (subscription) subscription.pause();
}

export function resume(args, msg){
    if (!msg.member.voice.channel) return;

    const subscription = MusicSubscription.getSubscription(msg.guild.id);
    if (subscription) subscription.resume();
}

