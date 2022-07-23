import * as SurfYT                      from "surfyt-api";
import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import * as Voice                       from "../voice/Voice.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import displayMusicDisplayer            from "../botModules/MusicDisplayer.mjs";
import MessageSafeDelete                from '../botModules/MessageSafeDelete.mjs';
import { SlashCommandBuilder }          from '@discordjs/builders';

// Checks

function memberConnectedInAVoiceChannelInGuildInteraction(interaction){
    if (
        interaction.member 
     && interaction.member.voice
     && interaction.member.voice.channel
     && interaction.member.voice.channel.guild
     && interaction.member.voice.channel.guild.id
     && interaction.guild
     && interaction.guild.id
     && (interaction.member.voice.channel.guild.id === interaction.guild.id)
    )
    return true;
    return false;
}

function replyYourNotConnected(interaction){
    MessagePrintReply.replyAlertOnInterarction(interaction, `Tu dois rejoindre un Salon Vocal de ce Serveur pour utiliser cette commande`);
}

// ________________________________________________________________
// Skip

function cmdSkip(interaction){
    if (!memberConnectedInAVoiceChannelInGuildInteraction(interaction)) return replyYourNotConnected(interaction);
    MessageSafeDelete.noReply(interaction);

    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (subscription) subscription.skip();
}

const slashSkip = new SlashCommandBuilder()
    .setName('skip')
    .setDescription(`PotatOS Music Player : SKIP | Skip la musique actuelle et joue la suivante (le cas échéant)`) //##LANG : Skip the current music and play the next (if there is one)
;

export const skip = {slash: slashSkip, command: cmdSkip};

// ________________________________________________________________
// Stop

function cmdStop(interaction){
    if (!memberConnectedInAVoiceChannelInGuildInteraction(interaction)) return replyYourNotConnected(interaction);
    MessageSafeDelete.noReply(interaction);

    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (subscription) subscription.destroy();
}

const slashStop = new SlashCommandBuilder()
    .setName('stop')
    .setDescription(`PotatOS Music Player : STOP | Met fin au lecteur de musique`) //##LANG : Terminate the music player
;

export const stop = {slash: slashStop, command: cmdStop};

// ________________________________________________________________
// Play

async function cmdPlay(interaction){
    if (!memberConnectedInAVoiceChannelInGuildInteraction(interaction)) return replyYourNotConnected(interaction);
    MessageSafeDelete.noReply(interaction);

    const query = interaction.options.getString('query');

    if (MessagePrintReply.isItAnHTTPURL(query)){
        Voice.streamVoice(interaction, query, 0.2);
    } else if (query === null){
        __playPause(interaction, false);
    }
    else{ // YOUTUBE SEARCH
        let searchResult = await SurfYT.searchYoutubeFor(`${query}`, {showVideos: true, location: 'FR', language: 'fr'}).catch((err)=>{MessagePrintReply.replyAlertOnInterarction(interaction, "Problème lors de la recherche")}); //##LANG : There was a problem while searching for a video;

        if (searchResult[0] && searchResult[0].url) Voice.streamVoice(interaction, searchResult[0].url, 0.2);
        else MessagePrintReply.replyAlertOnInterarction(interaction, `Aucune vidéo trouvée pour {${query}}`); //##LANG : No video found for {}
    }
}

const slashPlay = new SlashCommandBuilder()
    .setName('play')
    .setDescription(`PotatOS Music Player : PLAY | (Re)lance le lecteur de musique ou y ajoute une musique`) //##LANG : Resume the music, launch a music player or add a song to it
    .addStringOption(option => option
        .setName('query')
        .setDescription(`URL du média à jouer ou texte à chercher sur YouTube`) //##LANG : URL of the media to play or text to search in YouTube
    )


;

export const play = {slash: slashPlay, command: cmdPlay};

// ________________________________________________________________
// Pause

function cmdPause(interaction){
    if (!memberConnectedInAVoiceChannelInGuildInteraction(interaction)) return replyYourNotConnected(interaction);
    MessageSafeDelete.noReply(interaction);

    __playPause(interaction,true);
}

const slashPause = new SlashCommandBuilder()
    .setName('pause')
    .setDescription(`PotatOS Music Player : PAUSE | Met en pause le lecteur de musique`) //##LANG : Pause the music player
;

export const pause = {slash: slashPause, command: cmdPause};

// ________________________________________________________________
// UTILS

function __playPause(interaction, wannaPause){

    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (subscription) {
        if(wannaPause) subscription.pause();
        else subscription.resume();
        displayMusicDisplayer(interaction.channel);
    }

}

