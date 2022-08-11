import * as SurfYT                      from "surfyt-api";
import * as MessagePrintReply           from "../../botModules/MessagePrintReply.mjs";
import * as Voice                       from "../../botModules/voice/Voice.mjs"
import MusicSubscription                from "../../botModules/voice/MusicSubscription.mjs";
import displayMusicDisplayer            from "../../botModules/MusicDisplayer.mjs";
import MessageSafeDelete                from '../../botModules/MessageSafeDelete.mjs';
import * as DiscordJs                   from 'discord.js';
import * as UTILS                       from '../../botModules/Utils.mjs';
import * as LANG                        from "../../Language.mjs";
import * as RadioGarden                 from '../../botModules/RadioGarden.mjs';

// Checks

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function replyYourNotConnected(interaction) {
    await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._MUSICPLAYER_NOT_CONNECTED);
}

// _____________________________________________________________________________________________________________________
// Skip

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdSkip(interaction) {
    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription?.isMemberConnected(interaction.member)) {
        return await replyYourNotConnected(interaction);
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

// _____________________________________________________________________________________________________________________
// Stop

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdStop(interaction) {
    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription?.isMemberConnected(interaction.member)){
        return await replyYourNotConnected(interaction);
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

export const stop = { slash: slashStop, command: cmdStop };

// _____________________________________________________________________________________________________________________
// Play

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdPlay(interaction) {   
    if (MusicSubscription.goodMemberConnection(interaction.member)) {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        const query = interaction.options.getString('query');

        // No query so it's a Resume action
        if (query === null)
        {
            await __playPause(interaction, false);
        }
        // query is an URL 
        else if (UTILS.isItAnURL(query))
        {
            await Voice.streamVoice(interaction, query, 0.15);
        }
        // query is not an URL, so we search on YouTube
        else {
            let searchResult = await SurfYT.searchYoutubeFor(
                `${query}`,
                {showVideos: true, showLives: true, location: 'FR', language: 'fr'}
            )
                .catch(async (error)=>{
                    await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_ERROR)
                })
            ;

            if (searchResult[0] && searchResult[0].url) {
                await Voice.streamVoice(interaction, searchResult[0].url, 0.15);
            }
            else await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_NO_RESULT(query));
        }

        MessageSafeDelete.stopThinking(thinkingMessage);
    } else {
        return await replyYourNotConnected(interaction);
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

export const play = { slash: slashPlay, command: cmdPlay };

// _____________________________________________________________________________________________________________________
// Pause

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdPause(interaction) {
        const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (!subscription?.isMemberConnected(interaction.member)) {
        return await replyYourNotConnected(interaction);
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

export const pause = { slash: slashPause, command: cmdPause };

// _____________________________________________________________________________________________________________________
// Radio

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdRadio (interaction) {
    if (MusicSubscription.goodMemberConnection(interaction.member))
    {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        const query = interaction.options.getString('query');

        // query is an URL 
        if (UTILS.isItAnURL(query)) {
            if (RadioGarden.matchRadioChannelforId(query) != null) {
                await Voice.streamVoice(interaction, query, 0.15);
            } else {
                await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._RADIO_LINK_NOT_VALID(query));
            }
        }
        // query is not an URL, so we search on RadioGarden
        else {
            let searchURL = await RadioGarden.searchForRadioUrl(query)
                .catch(async (error)=>{
                    await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_NO_RESULT(query));
                })
            ;

            if (searchURL != undefined) {
                await Voice.streamVoice(interaction, `http://radio.garden${searchURL}`, 0.15);
            }
        }

        MessageSafeDelete.stopThinking(thinkingMessage);
    } else {
        return await replyYourNotConnected(interaction);
    }
}

const slashRadio = new DiscordJs.SlashCommandBuilder()
    .setName('radio')
    .setDescription(LANG._RADIO_DESC)
    .addStringOption(option => option
        .setName('query')
        .setDescription(LANG._RADIO_QUERY_DESC)
        .setRequired(true)  
    )
;

export const radio = { slash: slashRadio, command: cmdRadio };


// _____________________________________________________________________________________________________________________
// UTILS

/** 
 * @param {DiscordJs.ChatInputCommandInteraction} interaction 
 * @param {boolean} wannaPause
*/
async function __playPause(interaction, wannaPause) {

    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (subscription?.currentTrack?.metadata && !subscription.currentTrack.metadata.isLive) {
        if(wannaPause) subscription.pause();
        else subscription.resume();
        displayMusicDisplayer(interaction.channel);
    }
}
