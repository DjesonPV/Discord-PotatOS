import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import * as Voice                       from "../voice/Voice.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import displayMusicDisplayer            from "../botModules/MusicDisplayer.mjs";
import * as SurfYT from "surfyt-api";

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

export async function play(args, msg){
    if (!msg.member.voice.channel) return;

    if (MessagePrintReply.isItAnHTTPURL(args[0])){
        Voice.streamVoice(msg, args[0], 0.2);
    } else if (`${args}` === ""){
        playPause(msg, false);
    }
    else{ // YOUTUBE SEARCH
        let searchResult = await SurfYT.searchYoutubeFor(`${args.join(' ')}`, {showVideos: true, location: 'FR', language: 'fr'}).catch((err)=>{MessagePrintReply.printAlertOnChannel(msg.channel, "Problème lors de la recherche", 10)}); //##LANG : There was a problem while searching for a video;

        if (!searchResult[0] && !searchResult[0].url) MessagePrintReply.printAlertOnChannel(msg.channel, `Aucune vidéo trouvée pour {${songSearch}}`, 10); //##LANG : No video found for {}
        else Voice.streamVoice(msg, searchResult[0].url, 0.2);
    }
}

export function pause(args, msg){
    playPause(msg,true);
}

export function resume(args, msg){
    playPause(msg,false);
}

function playPause(msg,wannaPause){
    if (!msg.member.voice.channel) return;

    const subscription = MusicSubscription.getSubscription(msg.guild.id);
    if (subscription) {
        if(wannaPause) subscription.pause();
        else subscription.resume();
        displayMusicDisplayer(msg.channel);
    }

}

