import * as SurfYT                      from "surfyt-api";
import * as MessagePrintReply           from "../botModules/MessagePrintReply.mjs";
import * as Voice                       from "../voice/Voice.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import displayMusicDisplayer            from "../botModules/MusicDisplayer.mjs";
import MessageSafeDelete                from '../botModules/MessageSafeDelete.mjs';
import { SlashCommandBuilder }          from '@discordjs/builders';
import * as LANG from "../Language.mjs";

// Checks

function memberConnectedInAVoiceChannelInGuildInteraction(interaction){
    if (
        interaction.member 
     && interaction.member.voice
     && interaction.member.voice.channel
     && interaction.member.voice.channel.id
     && interaction.member.voice.channel.guild
     && interaction.member.voice.channel.guild.id
     && interaction.guild
     && interaction.guild.id
     && (interaction.member.voice.channel.guild.id === interaction.guild.id)
     && (!MusicSubscription.getSubscription(interaction.guild.id).voiceChannel || interaction.member.voice.channel.id === MusicSubscription.getSubscription(interaction.guild.id).voiceChannel.id)
    )
    return true;
    return false;
}

function replyYourNotConnected(interaction){
    MessagePrintReply.replyAlertOnInterarction(interaction, LANG._MUSICPLAYER_NOT_CONNECTED);
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
    .setDescription(LANG._SKIP_DESC)
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
    .setDescription(LANG._STOP_DESC)
;

export const stop = {slash: slashStop, command: cmdStop};

// ________________________________________________________________
// Play

async function cmdPlay(interaction){
    if (!memberConnectedInAVoiceChannelInGuildInteraction(interaction)) return replyYourNotConnected(interaction);

    const query = interaction.options.getString('query');

    if (MessagePrintReply.isItAnHTTPURL(query)){
        Voice.streamVoice(interaction, query, 0.2);
        MessageSafeDelete.noReply(interaction);
    } else if (query === null){
        __playPause(interaction, false);
        MessageSafeDelete.noReply(interaction);
    }
    else{ // YOUTUBE SEARCH
        let searchResult = await SurfYT.searchYoutubeFor(`${query}`, {showVideos: true, location: 'FR', language: 'fr'})
            .catch((err)=>{
                MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_ERROR)
            })
        ;

        if (searchResult[0] && searchResult[0].url) {
            Voice.streamVoice(interaction, searchResult[0].url, 0.2);
            MessageSafeDelete.noReply(interaction);
        }
        else MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_NO_RESULT(query));
    }
}

const slashPlay = new SlashCommandBuilder()
    .setName('play')
    .setDescription(LANG._PLAY_DESC)
    .addStringOption(option => option
        .setName('query')
        .setDescription(LANG._PLAY_QUERY_DESC)
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
    .setDescription(LANG._PAUSE_DESC)
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
