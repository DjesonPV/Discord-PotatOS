import * as DiscordJsVoice from '@discordjs/voice';
import * as DiscordJs from 'discord.js';

import * as MessagePrintReply from "../MessagePrintReply.mjs";
import MessageSafeDelete from "../MessageSafeDelete.mjs";

import SubscriptionPlaylist from './SubscriptionPlaylist.mjs';

import * as NodeUtil from 'node:util';
import MusicDisplayer from './MusicDisplayer.mjs';

export default class VoiceSubscription {

    static #subscriptions = new Map();

    #audioPlayer = DiscordJsVoice.createAudioPlayer();
    /** @type {MusicDisplayer} */
    #musicDisplayer;
    #isPaused = false;
    #voiceConnectionReadyLock = false;
    playlist = new SubscriptionPlaylist();
    #voiceConnection;
    /** @type {DiscordJs.Message | null} */
    #message = null;
    #textChannel;
    /** @type {boolean | NodeJS.Timeout} */
    #playedEnough = false;
    #playedEnoughCount = 1;

    /**
     * @param {DiscordJs.ChatInputCommandInteraction} interaction 
     */
    constructor(interaction, dontDisplayMusicPlayer) {
        this.#voiceConnection = DiscordJsVoice.joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: true,
        });

        this.#textChannel = interaction.channel;
        if (!dontDisplayMusicPlayer) this.#setupMusicDisplayer();

        this.#voiceConnection.on('stateChange', async (oldState, newState) => {
            if (isVoiceConnectionDisconnected(newState.status)) {
                if (isVoiceConnectionDisconnectBecauseOfNetwork(newState)) {
                    try { // Probably moved voice channel
                        await DiscordJsVoice.entersState(this.#voiceConnection, DiscordJsVoice.VoiceConnectionStatus.Connecting, 5000);
                    } catch (err) { // Probably removed from voice channel
                        this.unsubscribe();
                    }
                } else if (this.#voiceConnection.rejoinAttempts < 10) {
                    await NodeUtil.promisify(setTimeout)((this.#voiceConnection.rejoinAttempts + 1) * 5000);
                    this.#voiceConnection.rejoin();
                } else {
                    this.#voiceConnection.destroy();
                }
            } else if (isVoiceConnectionDestroyed(newState.status)) {
                this.#unsubscribeFinish();
            } else if ( isVoiceConnectionConnecting(this.#voiceConnectionReadyLock, newState.status)) {
                // Destroy the connection if it's doesn't manage to connect in 20 seconds 
                this.#voiceConnectionReadyLock = true;
                try {
                    await DiscordJsVoice.entersState(this.#voiceConnection, DiscordJsVoice.VoiceConnectionStatus.Ready, 20000);
                } catch (err) {
                    if (isVoiceConnectionDestroyed(this.#voiceConnection.state.status)) {
                        this.#voiceConnection.destroy();
                    }
                } finally {
                    this.#voiceConnectionReadyLock = false;
                    if (oldState.subscription !== undefined) {
                        this.#musicDisplayer?.messageOptions(undefined, this.#voiceConnection.joinConfig, undefined); // force Channel Update
                        this.updateMusicDisplayer();
                    }
                }
            }
        });

        this.#audioPlayer.on('stateChange', async (oldState, newState) => {
            if (isAudioPlayerIdled(newState.status) && !this.isPaused) { // this.isPaused take into account 'paused' livestreams
                // When a track finishes
                if (this.#playedEnough === true) {
                    this.skip();
                } else {
                    if (this.#playedEnoughCount > 0) {
                        clearTimeout(this.#playedEnough);
                        this.#playedEnough = false;
                        this.#playedEnoughCount--;
                        this.playlist.fetchCurrentAudio();
                    } else {
                        this.playlist.current.failed = true;
                        this.playlist.emit('audioPlay');
                    }
                }
                 
            } else if (isAudioPlayerPlayling(newState.status)) {
                // When a track begins
                if (this.#playedEnough === false) { 
                    this.#playedEnoughCount = 30; 
                }
                this.#playedEnough = setTimeout(() =>{this.#playedEnough = true}, 100);
            }
        });

        this.#audioPlayer.on('error', async (error)=> {
            console.error('---\nAudio Player\n\n');
            console.error(error);
            console.error('\n---');
            this.skip();
        });

        this.#voiceConnection.subscribe(this.#audioPlayer);

        this.playlist.on('audioPlay', () => {
            if (this.playlist.current.failed) {
                setTimeout(() => {if (this.playlist.current.failed) this.skip()}, 5000);
            } else {
                this.#audioPlayer.play(this.playlist.current.audio);
                this.#isPaused = false;
                this.#selfMute(this.isPaused);
            }
            this.updateMusicDisplayer();
        });

        this.playlist.on('dataShow', () => {
            this.updateMusicDisplayer();
        });

        this.playlist.on('playlistChanged', () => {
            this.updateMusicDisplayerComponents();
        })

        VoiceSubscription.#subscriptions.set(interaction.guild.id, this);
    } // constructor(interaction)

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // static methods

    /**
     * @param {DiscordJs.Snowflake} guildId 
     * @returns {VoiceSubscription | undefined}
     */
    static get(guildId) {
        return guildId !== undefined? VoiceSubscription.#subscriptions.get(guildId) : undefined;
    }

    /** @param {DiscordJs.ChatInputCommandInteraction} interaction */
    static create(interaction, dontDisplayMusicPlayer = false) {
        const existingSubscription = VoiceSubscription.get(interaction.guild.id)

        if (existingSubscription !== undefined && existingSubscription.isMemberConnected(interaction.member)) {
            return {subscription: existingSubscription, isNew: false};
        } else if (existingSubscription === undefined && isMemberConnectedToAVoiceChannel(interaction.member)) {
            return {subscription: new VoiceSubscription(interaction, dontDisplayMusicPlayer),  isNew: true};
        } else {
            return {subscription: undefined, isNew: false};
        }

    }

    /** @param {DiscordJs.GuildMember} member */
	isMemberConnected(member) {
		return (
			// Member in the same Guild (edgecase)
			(member?.guild?.id === this.#voiceConnection.joinConfig.guildId) &&
			// And Member is connected to the right VoiceChannel
			(member?.voice?.channel?.id === this.#voiceConnection.joinConfig.channelId)
		);
	}

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // this methods

    pause() {
        try{
            if (this.playlist.current.live){
                const paused = this.#audioPlayer.stop();
                this.#isPaused = paused;
                this.#selfMute(this.isPaused);
                this.updateMusicDisplayerComponents();
                return paused;

            } else {
                const paused = this.#audioPlayer.pause();
                this.#isPaused = paused;
                this.#selfMute(this.isPaused);
                this.updateMusicDisplayerComponents();
                return paused;
            }
        } catch (e) {
            return false;
        };
    }

    unpause() {
        try{
            if (this.playlist.current.live) {
                this.playlist.fetchCurrentAudio();
                this.#playedEnough = false;
                return true;
            } else {
                const unpaused = this.#audioPlayer.unpause();
                this.#isPaused = false;
                this.#selfMute(this.isPaused);
                this.updateMusicDisplayerComponents();
                return unpaused;
            }
        } catch (e) {
            return false;
        };
    }

    skip(){
        this.#isPaused = true;
        this.#audioPlayer.stop(false);
        this.playlist.next();
        if (this.playlist.current !== undefined) {
            this.playlist.fetchCurrentAudio();
        } else if (this.playlist.isEmpty()) {
            this.unsubscribe();
        }
    }

    get isPaused() {
        return this.#isPaused;
    }

    /** @param {boolean} muted */
    #selfMute(muted) {
        return this.#voiceConnection.rejoin({
			...this.#voiceConnection.joinConfig,
			selfMute: muted,
		});
    }

    unsubscribe() {  // nuke this
        this.#isPaused = true;
        this.#deleteMusicDisplayer();
        this.#audioPlayer.stop(false);
		try {
            this.#voiceConnection.destroy();
        } catch (_) {}

        this.playlist.kill();
    }

    #unsubscribeFinish() {
        const guildId = this.#voiceConnection.joinConfig.guildId;
        VoiceSubscription.#subscriptions.delete(guildId);
    }

    async #setupMusicDisplayer() {
        if (this.#musicDisplayer === undefined) {
            this.#musicDisplayer = new MusicDisplayer(this.#voiceConnection.joinConfig);
        }

        await MessagePrintReply.printOnChannel(this.#textChannel, this.#musicDisplayer.messageOptions())
            .then(message => {this.#message = message});
        ;
    }

    /** @returns {boolean} */
    #canShowPlayer() {
        if ( (this.#musicDisplayer === undefined) ) {
            // No MusicDisplayer already exsit
            if ( this.playlist.hasQueue()) {
                // There is Queue so we create musicDisplayer and retry;
                this.#setupMusicDisplayer();
                return this.#canShowPlayer();
            } else {
                // No queue, so it's a lonely soundSample
                return false;
            }
        }
        else {
            return ((this.#message !== null && MessageSafeDelete.isMessageMine(this.#message) && this.#message.editable));
        }
    }

    updateMusicDisplayer() {
        if(this.#canShowPlayer()){
            this.#message.edit(this.#musicDisplayer.messageOptions(
                this.playlist,
                this.#voiceConnection.joinConfig, 
                {
                    isLive: this.playlist.current.live, 
                    isPaused: this.isPaused,
                    hasQueue: this.playlist.hasQueue(),
                },
                this.playlist.current.failed
            ))
                .then(message => {
                    this.#message = message;
                })
                .catch((error) => console.error(error))
            ;
        }
    }

    updateMusicDisplayerComponents() {
        if(this.#canShowPlayer()) {
            this.#message.edit({ 
                components : this.#musicDisplayer.messageOptionsComponents(this.playlist, {
                    isLive: this.playlist.current.live, 
                    isPaused: this.isPaused,
                    hasQueue: this.playlist.hasQueue(),
                })
            })
                .then(message => {
                    this.#message = message;
                })
                .catch((error) => console.error(error))
            ;
        }
    }

    #deleteMusicDisplayer() {
        if (this.#message !== null) MessageSafeDelete.deleteMessage(this.#message).then(() => {this.#message = null;});
    }

} // class VoiceSubscription


const isVoiceConnectionDisconnected = (status) => (status === DiscordJsVoice.VoiceConnectionStatus.Disconnected);
const isVoiceConnectionDisconnectBecauseOfNetwork = (state) => (state.reason === DiscordJsVoice.VoiceConnectionDisconnectReason.WebSocketClose && state.closeCode === 4014);
const isVoiceConnectionDestroyed = (status) => (status === DiscordJsVoice.VoiceConnectionStatus.Destroyed);
const isVoiceConnectionConnecting = (readyLock, status) => (!readyLock && ( status === DiscordJsVoice.VoiceConnectionStatus.Connecting || status === DiscordJsVoice.VoiceConnectionStatus.Signalling));

const isAudioPlayerIdled = (status) => (status === DiscordJsVoice.AudioPlayerStatus.Idle);
const isAudioPlayerPlayling = (newStatus) => (newStatus === DiscordJsVoice.AudioPlayerStatus.Playing);

const isMemberConnectedToAVoiceChannel = (member) => (member.voice?.channel?.id !== undefined);
