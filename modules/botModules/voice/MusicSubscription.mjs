import * as DiscordJsVoice              from '@discordjs/voice';
import * as DiscordJs                   from 'discord.js';
import * as NodeUtil                    from 'node:util';
import ExploreChannels                  from "../ExploreChannels.mjs";
import MessageSafeDelete                from '../MessageSafeDelete.mjs';
import Track from './Track.mjs';
import * as Voice                       from "./Voice.mjs"

const wait = NodeUtil.promisify(setTimeout);

export default class MusicSubscription{

    static subscriptions = new Map();

    /** @param {DiscordJs.CommandInteraction} interaction */
    constructor(interaction){
        /** @type {DiscordJsVoice.VoiceConnection} */
       this.voiceConnection = DiscordJsVoice.joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: true,
        }),
       this.audioPlayer = DiscordJsVoice.createAudioPlayer();
       /** @type {Track[]} */
       this.queue = [];
       this.queueLock = false;
       this.readyLock = false;
       this.currentTrack;
       /** @type {DiscordJs.VoiceChannel} */
       this.voiceChannel = interaction.member.voice.channel;
       this.guildId = interaction.guild.id;
       this.guildName = interaction.guild.name;
       /** @type {DiscordJs.Message} */
       this.message = undefined;
       this.stopedForLive = false;

        // Voice Connection
        this.voiceConnection.on('stateChange', async (_, newState) => {
            if (newState.status === DiscordJsVoice.VoiceConnectionStatus.Disconnected){
                if (newState.reason === DiscordJsVoice.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014){
                    try {
                        await DiscordJsVoice.entersState(this.voiceConnection, DiscordJsVoice.VoiceConnectionStatus.Connecting, 5000);
                        // Probably moved voice channel
                    } catch (err){
                        this.voiceConnection.destroy();
                        // Probably removed from voice channel

                    }

                } else if (this.voiceConnection.rejoinAttempts < 10){
                        // The disconneced can be recoverable, and we didnt try to reconnect to much, so we'll reconnect
                        await wait((this.voiceConnection.rejoinAttempts + 1)* 5000);
                        this.voiceConnection.rejoin();
                    }
                    else {
                        // can be recoverable, but we tried too many times
                        this.voiceConnection.destroy();
                    }
            
            } else if (newState.status === DiscordJsVoice.VoiceConnectionStatus.Destroyed){
                this.stop();
            } else if (
                !this.readyLock &&
                (newState.status === DiscordJsVoice.VoiceConnectionStatus.Connecting || newState.status === DiscordJsVoice.VoiceConnectionStatus.Signalling)
            ) {
                /**
                 * destroy the connection if it's in a unwanted idle state for more than 20 sec 
                 */
                this.readyLock = true;
                try {
                    await DiscordJsVoice.entersState(this.voiceConnection, DiscordJsVoice.VoiceConnectionStatus.Ready, 30_000);
                } catch (err){
                    if (this.voiceConnection.state.status !== DiscordJsVoice.VoiceConnectionStatus.Destroyed){
                        this.voiceConnection.destroy();
                    }
                } finally {
                    this.readyLock = false;
                }
            } else if ( newState.subscription.connection.joinConfig.channelId !== this.voiceChannel.id){
                this.updateVoiceChannel(newState.subscription.connection.joinConfig.channelId);
            }

        });

        // Audio Player
        this.audioPlayer.on('stateChange', async (oldState, newState) => {
            if (newState.status === DiscordJsVoice.AudioPlayerStatus.Idle && !this.stopedForLive){
                await oldState.resource.metadata.onFinish();
                this.processQueue();
            } else if (newState.status === DiscordJsVoice.AudioPlayerStatus.Playing){
                // If a started playing, then start the new track
                await newState.resource.metadata.onStart();
            }

        });


        this.audioPlayer.on('error', async (error)=> {
            await error.resource.metadata.onError(error);
        });

        this.voiceConnection.subscribe(this.audioPlayer);

    }

    enqueue(track){
        this.queue.push(track);
        this.processQueue();
    }

    enskip(track){
        this.queue.unshift(track);
        this.audioPlayer.stop(true);
        this.processQueue();
    }

    stop(){
       this.queueLock = true;
       this.queue = [];
       this.audioPlayer.stop(true);
    }

    skip(){
        this.audioPlayer.stop();
        this.resume();
     }

    setMessage(msg){
        this.message = msg;
    }

    pause(){
        this.audioPlayer.pause();
        this.setSelfMute(true);
    }

    resume(){
        this.setSelfMute(false);
        this.audioPlayer.unpause();
    }

    stopLive(){
        this.queueLock = true;
        this.stopedForLive = true;
        this.audioPlayer.stop();
        this.setSelfMute(true);
    }

    async restartLive(interaction){
        this.setSelfMute(false);
        this.queueLock = false;
        this.stopedForLive = false;
        await Voice.streamVoice(interaction, this.currentTrack.url, this.currentTrack.volume, true);
    }

    setSelfMute(selfMute){
        return this.voiceConnection.rejoin({
            ...this.voiceConnection.joinConfig,
            selfMute: selfMute,
        });
    }

    isPaused(){
        return ((this.audioPlayer.state.status === DiscordJsVoice.AudioPlayerStatus.Paused) || this.stopedForLive);
    }

    updateVoiceChannel(voiceChannelId){
        this.voiceChannel = ExploreChannels.voice.get(voiceChannelId);
    }

    /** @param {DiscordJs.GuildMember} member */
    isMemberConnected(member){
        return (
            // Member in the same Guild (edgecase)
            (member?.guild?.id === this.guildId) &&
            // And Member is connected to the right VoiceChannel
            (member?.voice?.channel?.id === this.voiceChannel?.id)
        );
    }

    /** @param {DiscordJs.GuildMember} member */
    static goodMemberConnection(member){
        const subscription = MusicSubscription.getSubscription(member?.guild?.id);

        return ( (member.voice?.channel?.id !== undefined) && 
        (
            (subscription === undefined) ||
            (subscription?.isMemberConnected(member)) 
        ));
    }

    async processQueue() {
        if (
            (!this.queueLock) && 
            (this.audioPlayer.state.status === DiscordJsVoice.AudioPlayerStatus.Idle) &&
            (this.queue.length !== 0)
        ) {
           
            this.queueLock = true;

            const nextTrack = this.queue.shift();
            this.currentTrack = nextTrack;

            try {
                const resource = await nextTrack.createAudioResource();
                resource.volume.setVolume(nextTrack.volume);
                this.audioPlayer.play(resource);
                this.queueLock = false;
            } catch (error) {
                nextTrack.onError(error);
                this.queueLock = false;
                return this.processQueue();
            }
        }
    }

    /** @param {Track} track */
    removeTrack(track) {
        this.queueLock = true;
        const foundTrack = this.queue.find(queuedTrack => queuedTrack === track);
        if (foundTrack !== undefined) {
            this.queue.splice(this.queue.indexOf(foundTrack), 1);
        }
        this.queueLock = false;
    }

    /** @param {Track} track */
    moveTrackToFirstPosition(track) {
        this.queueLock = true;
        const foundTrack = this.queue.find(queuedTrack => queuedTrack === track);
        if (foundTrack !== undefined) {
            this.queue.splice(this.queue.indexOf(foundTrack), 1);
            this.queue.unshift(foundTrack);
        }
        this.queueLock = false;
    }

    /** @returns {MusicSubscription} */
    static getNewSubscription(interaction){
        let subscription = this.getSubscription(interaction.guild.id);
        if (subscription) {
            return subscription;
        } else {
            return this.createSubcription(interaction);
        }
    
    }

    /** @returns {MusicSubscription} */
    static getSubscription(guildId){
        let subscription = this.subscriptions.get(guildId);
        if (subscription) {
            return subscription;
        } else {
            return undefined;
        }   
        
    }

    static createSubcription(interaction){
        let subscription = new MusicSubscription(interaction);
        subscription.voiceConnection.on('error', console.warn);
        this.subscriptions.set(interaction.guild.id, subscription);
        return this.subscriptions.get(interaction.guild.id);
    }

    async destroy(){   
        if (this.voiceConnection.state.status !== DiscordJsVoice.VoiceConnectionStatus.Destroyed) {
            this.voiceConnection.destroy();
        }
        MessageSafeDelete.deleteMessage(this.message);
        MusicSubscription.subscriptions.delete(this.guildId);
    }
}
