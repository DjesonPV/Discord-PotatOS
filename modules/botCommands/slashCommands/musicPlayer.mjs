import * as SurfYT                      from "surfyt-api";
import * as MessagePrintReply           from "../../botModules/MessagePrintReply.mjs";
import * as Voice                       from "../../botModules/voice/Voice.mjs"
import MusicSubscription                from "../../botModules/voice/MusicSubscription.mjs";
import displayMusicDisplayer            from "../../botModules/MusicDisplayer.mjs";
import MessageSafeDelete                from '../../botModules/MessageSafeDelete.mjs';
import * as DiscordJs                   from 'discord.js';
import * as LANG from "../../Language.mjs";

// Checks

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
function replyYourNotConnected(interaction){
    MessagePrintReply.replyAlertOnInterarction(interaction, LANG._MUSICPLAYER_NOT_CONNECTED);
}

// ________________________________________________________________
// Skip

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdSkip(interaction){
    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription?.isMemberConnected(interaction.member)){
        return replyYourNotConnected(interaction);
    }
    else {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        subscription.skip();

        MessageSafeDelete.stopThinking(thinkingMessage); 
    }
}

const slashSkip = new DiscordJs.SlashCommandBuilder()
    .setName('skip')
    .setDescription(LANG._SKIP_DESC)
;

export const skip = {slash: slashSkip, command: cmdSkip};

// ________________________________________________________________
// Stop

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdStop(interaction){
    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription?.isMemberConnected(interaction.member)){
        return replyYourNotConnected(interaction);
    }
    else {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        subscription.stop();

        MessageSafeDelete.stopThinking(thinkingMessage); 
    }
}

const slashStop = new DiscordJs.SlashCommandBuilder()
    .setName('stop')
    .setDescription(LANG._STOP_DESC)
;

export const stop = {slash: slashStop, command: cmdStop};

// ________________________________________________________________
// Play

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdPlay(interaction){
    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    
    if (MusicSubscription.goodMemberConnection(interaction.member))
    {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        const query = interaction.options.getString('query');

        // No query so it's a Resume action
        if (query === null)
        {
            await __playPause(interaction, false);
        }
        // query is an URL 
        else if (isItAnURL(query))
        {
            await Voice.streamVoice(interaction, query, 0.2);
        }
        // query is not an URL, so we search on YouTube
        else 
        {
            let searchResult = await SurfYT.searchYoutubeFor(
                `${query}`,
                {showVideos: true, showLives: true, location: 'FR', language: 'fr'}
            )
                .catch((error)=>{
                    MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_ERROR)
                })
            ;

            if (searchResult[0] && searchResult[0].url) {
                await Voice.streamVoice(interaction, searchResult[0].url, 0.2);
            }
            else MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_NO_RESULT(query));
        }

        MessageSafeDelete.stopThinking(thinkingMessage);
    } else {
        return replyYourNotConnected(interaction);
    }
}

const slashPlay = new DiscordJs.SlashCommandBuilder()
    .setName('play')
    .setDescription(LANG._PLAY_DESC)
    .addStringOption(option => option
        .setName('query')
        .setDescription(LANG._PLAY_QUERY_DESC)
    )
;

export const play = {slash: slashPlay, command: cmdPlay};

//
// URL test

function isItAnURL(text){
    return (typeof text == "string") &&
    (text.match(/^(https?|http):\/\/([a-zA-Z0-9\-]{1,64}\.){0,}([a-zA-Z0-9\-]{2,63})(\.(xn--)?[a-zA-Z0-9]{2,})(\:[0-9]{1,5})?\/([^\s]*)?$/))
    ;
}

// ________________________________________________________________
// Pause

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdPause(interaction){
        const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription?.isMemberConnected(interaction.member)){
        return replyYourNotConnected(interaction);
    }
    else {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);
        
        await __playPause(interaction,true);

        MessageSafeDelete.stopThinking(thinkingMessage); 
    }
}

const slashPause = new DiscordJs.SlashCommandBuilder()
    .setName('pause')
    .setDescription(LANG._PAUSE_DESC)
;

export const pause = {slash: slashPause, command: cmdPause};

// ________________________________________________________________
// UTILS

/** 
 * @param {DiscordJs.ChatInputCommandInteraction} interaction 
 * @param {boolean} wannaPause
*/
async function __playPause(interaction, wannaPause){

    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (subscription?.currentTrack?.metadata && !subscription.currentTrack.metadata.isLive) {
        if(wannaPause) subscription.pause();
        else subscription.resume();
        displayMusicDisplayer(interaction.channel);
    }
}
