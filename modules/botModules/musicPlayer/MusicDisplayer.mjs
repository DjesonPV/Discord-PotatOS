import * as DiscordJs                   from "discord.js";
import * as DiscordJsVoice              from "@discordjs/voice";
import * as ButtonInteractions          from "../../botCommands/ButtonInteractions.mjs";
import * as SelectMenuInteractions      from "../../botCommands/SelectMenuInteractions.mjs";
import ExploreChannel from '../ExploreChannels.mjs';

import * as LANG from "../../Language.mjs";
import SubscriptionPlaylist from "./SubscriptionPlaylist.mjs";

export default class MusicDisplayer {

    /** @type {DiscordJs.EmbedBuilder} */
    #displayerEmbed;
    /** @type {DiscordJs.ActionRowBuilder<DiscordJs.SelectMenuBuilder> | null} */
    #displayerPlaylistRow = null;
    /** @type {DiscordJs.ActionRowBuilder<DiscordJs.ButtonBuilder>} */
    #displayerButtonRow;

    /** @type {string} */
    #currentGuildName;
    /** @type {string} */
    #currentVoiceChannelName;

    /** @param {DiscordJsVoice.JoinConfig} voiceJoinConfig */
    constructor(voiceJoinConfig) {

        this.#updateNames(voiceJoinConfig);

        this.#displayerEmbed = new DiscordJs.EmbedBuilder()
            .setColor(LANG.MUSICDISPLAYER_BOT_COLOR)
            .setTitle(LANG.MUSICDISPLAYER_LOADING)
            .setDescription(LANG.MUSICDISPLAYER_LOADING_ASCII_ART)
            .setAuthor({
                name : LANG.BOT_NAME,
                iconURL : LANG.BOT_ICON,
            })
            .setFooter({text : LANG.MUSICDISPLAYER_FOOTER(this.#currentGuildName, this.#currentVoiceChannelName)});
        ;

        this.#displayerButtonRow = new DiscordJs.ActionRowBuilder()
            .addComponents(
                ButtonInteractions.musicPlayer.button,
                ButtonInteractions.musicPlayerPlayPause.button(false, true, true),
                ButtonInteractions.musicPlayerSkip.button(true),
                ButtonInteractions.musicPlayerStop.button(false),
            )
        ;
    }

    /** @param {DiscordJsVoice.JoinConfig} voiceJoinConfig */
    #updateNames(voiceJoinConfig) {
        this.#currentGuildName = ExploreChannel.guilds.get(voiceJoinConfig.guildId).name;
        this.#currentVoiceChannelName = ExploreChannel.voice.get(voiceJoinConfig.channelId).name;
    }

    /**
     * @param {SubscriptionPlaylist | undefined} subscriptionPlaylist 
     * @param {DiscordJsVoice.JoinConfig | undefined} voiceJoinConfig 
     * @param {{isLive: boolean, isPaused: boolean, hasQueue: boolean,}} buttonOptions
     * @returns 
     */
    messageOptions (subscriptionPlaylist = undefined, voiceJoinConfig = undefined, buttonOptions = undefined) {

        if (subscriptionPlaylist !== undefined) {
            const curatedDataPlaylist = subscriptionPlaylist.getCuratedDataPlaylist();

            this.#updateEmbed(curatedDataPlaylist[0]);
            this.#updatePlaylist(curatedDataPlaylist);
        }
        if (voiceJoinConfig !== undefined) {
            this.#updateNames(voiceJoinConfig);
        }

        /** @type {DiscordJs.MessageOptions} */
        let messageOptions = {
            embeds: [this.#displayerEmbed],
            components: this.messageOptionsComponents(subscriptionPlaylist, buttonOptions),
        };

        return messageOptions;
    }

    /**
     * @param {SubscriptionPlaylist | undefined} subscriptionPlaylist 
     * @param {{
     *  isLive: boolean,
     *  isPaused: boolean,
     *  hasQueue: boolean,
     * }} buttonOptions 
     */
    messageOptionsComponents(subscriptionPlaylist = undefined, buttonOptions = undefined) {

        if (buttonOptions !== undefined) {
            this.#updateButtons(buttonOptions.isLive, buttonOptions.isPaused, buttonOptions.hasQueue);
        }
        if (subscriptionPlaylist !== undefined) {
            this.#updatePlaylist(subscriptionPlaylist.getCuratedDataPlaylist());
        }

        let components = [this.#displayerButtonRow];
        if (this.#displayerPlaylistRow !== null) components.unshift(this.#displayerPlaylistRow);

        return components;
    }

    /** @param {import("./SubscriptionPlaylist.mjs").CuratedTrackData} curatedTrackData */
    #updateEmbed(curatedTrackData) {
        const displayerEmbed = new DiscordJs.EmbedBuilder()
            .setColor(curatedTrackData.data.color)
            .setTitle(curatedTrackData.data.title)
            .setDescription(curatedTrackData.data.description)
            .setAuthor(curatedTrackData.data.author)
            .setThumbnail(curatedTrackData.data.thumbnail ?? LANG.MUSICDISPLAYER_DEFAULT_THUMBNAIL)
            .setFooter({text : LANG.MUSICDISPLAYER_FOOTER(this.#currentGuildName, this.#currentVoiceChannelName)});
        ;
        if (curatedTrackData.data.url !== undefined) displayerEmbed.setURL(curatedTrackData.data.url);

        this.#displayerEmbed = displayerEmbed;
    }

    /** @param {Array<import("./SubscriptionPlaylist.mjs").CuratedTrackData>} curatedDataPlaylist*/
    #updatePlaylist(curatedDataPlaylist) {

        if (curatedDataPlaylist.length > 1) {
            this.#displayerPlaylistRow = new DiscordJs.ActionRowBuilder()
                .addComponents(
                    SelectMenuInteractions.musicPlayerPlaylist.selectMenu(curatedDataPlaylist),
                )
            ;
        } else {
            this.#displayerPlaylistRow = null;
        }
    }

    /**
     * 
     * @param {boolean} isLive 
     * @param {boolean} isPaused 
     * @param {boolean} hasQueue 
     */
    #updateButtons(isLive, isPaused, hasQueue) {
        this.#displayerButtonRow = new DiscordJs.ActionRowBuilder()
            .addComponents(
                ButtonInteractions.musicPlayer.button,
                ButtonInteractions.musicPlayerPlayPause.button(isPaused, isLive, false),
                ButtonInteractions.musicPlayerSkip.button(!hasQueue),
                ButtonInteractions.musicPlayerStop.button(false),
            )
        ;
    }

} // class MusicDisplayer
