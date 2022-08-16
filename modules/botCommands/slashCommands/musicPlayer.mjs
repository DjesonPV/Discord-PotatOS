import * as DiscordJs from 'discord.js';

import VoiceSubscription from "../../botModules/musicPlayer/VoiceSubscription.mjs";
import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';
import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";

import * as UTILS from '../../botModules/Utils.mjs';
import * as LANG from '../../Language.mjs';

import * as SurfYT from "surfyt-api";
import * as RadioGarden from '../../botModules/RadioGarden.mjs';


/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
function replyYourNotConnected(interaction) {
    MessagePrintReply.replyAlertOnInterarction(interaction, LANG._MUSICPLAYER_NOT_CONNECTED);
}

//______________________________________________________________________________________________________________________
// Play

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdPlay(interaction) {
    const {subscription, isNew} = VoiceSubscription.create(interaction);
    if (subscription?.isMemberConnected(interaction.member)) {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        const query = interaction.options.getString('query');
        let url = undefined;
        let queryString = query;

        
        if (query === null) {
            // No query so it's a Resume action
            if (subscription.isPaused) subscription.unpause();
        }
        else if (UTILS.isItAnURL(query)) {
            // Query is an URL
            url = query;
            queryString = null;
        } else {
            // Query is a string
            let searchResult = await SurfYT.searchYoutubeFor(
                `${query}`,
                {showVideos: true, showLives: true, showShorts: true, location: 'FR', language: 'fr'}
            )
                .catch(async (error)=>{
                    await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_ERROR)
                })
            ;

            if (searchResult[0] && searchResult[0].url) {
                url = searchResult[0].url;
                queryString = query;
            }
            else await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_NO_RESULT(query));
        }

        if (url !== undefined) { 
            subscription.playlist.add(url, interaction.id, 0.15, queryString);
            if (isNew) subscription.playlist.fetchCurrentAudio();
        }

        MessageSafeDelete.stopThinking(thinkingMessage); 
    } else {
        replyYourNotConnected(interaction);
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

//______________________________________________________________________________________________________________________
// Skip

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdSkip(interaction) {
    const subscription = VoiceSubscription.get(interaction.guild.id);
    if (subscription?.isMemberConnected(interaction.member)) {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        subscription.skip();

        MessageSafeDelete.stopThinking(thinkingMessage); 
    } else {
        replyYourNotConnected(interaction);
    }
}

const slashSkip = new DiscordJs.SlashCommandBuilder()
    .setName('skip')
    .setDescription('fonction de test d\'un nouveau systeme audio')
;

export const skip = {slash: slashSkip, command: cmdSkip};

//______________________________________________________________________________________________________________________
// Pause

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdPause(interaction) {
    const subscription = VoiceSubscription.get(interaction.guild.id);
    if (subscription?.isMemberConnected(interaction.member)) {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        if (!subscription.isPaused) subscription.pause();

        MessageSafeDelete.stopThinking(thinkingMessage); 
    } else {
        replyYourNotConnected(interaction);
    }
}

const slashPause = new DiscordJs.SlashCommandBuilder()
    .setName('pause')
    .setDescription(LANG._PAUSE_DESC)
;

export const pause = { slash: slashPause, command: cmdPause };

//______________________________________________________________________________________________________________________
// Stop

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdStop(interaction) {
    const subscription = VoiceSubscription.get(interaction.guild.id);
    if (subscription?.isMemberConnected(interaction.member)) {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        subscription.unsubscribe();

        MessageSafeDelete.stopThinking(thinkingMessage); 
    } else {
        replyYourNotConnected(interaction);
    }
}

const slashStop = new DiscordJs.SlashCommandBuilder()
    .setName('stop')
    .setDescription(LANG._STOP_DESC)
;

export const stop = {slash: slashStop, command: cmdStop};

//______________________________________________________________________________________________________________________
// Radio

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdRadio(interaction) {
    const {subscription, isNew} = VoiceSubscription.create(interaction);
    if (subscription?.isMemberConnected(interaction.member)) {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);

        const query = interaction.options.getString('query');
        let url = undefined;
        let queryString = query;

        if (UTILS.isItAnURL(query)) {
            // Query is an URL
            if (RadioGarden.matchRadioChannelforId(query) != null) {
                url = query;
                queryString = null;
            } else {
                MessagePrintReply.replyAlertOnInterarction(interaction, LANG._RADIO_LINK_NOT_VALID(query));
            }
        } else {
            // Query is a string
            let searchURL = await RadioGarden.searchForRadioUrl(query)
                .catch(async (error)=>{
                    await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._PLAY_SEARCH_NO_RESULT(query));
                })
            ;

            if (searchURL != undefined) {
                url = `http://radio.garden${searchURL}`;
            }
        }

        if (url !== undefined) { 
            subscription.playlist.add(url, interaction.id, 0.15, query);
            if (isNew) subscription.playlist.fetchCurrentAudio();
        }

        MessageSafeDelete.stopThinking(thinkingMessage); 
    } else {
        replyYourNotConnected(interaction);
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
