import {
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
    joinVoiceChannel,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { promisify } from 'node:util';

const wait = promisify(setTimeout);

export class MusicSubscription{

    static subscriptions = new Map();

    constructor(voiceChannel){
       this.voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        }),
       this.audioPlayer = createAudioPlayer();
       this.queue = [];
       this.queueLock = false;
       this.readyLock = false;
       this.currentTrack;
       

    // Voice Connection
        this.voiceConnection.on('stateChange', async (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected){
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014){
                    try {
                        await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5000);
                        // Probably moved voice channel
                    } catch {
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
            
            } else if (newState.status === VoiceConnectionStatus.Destroyed){
                this.stop();
            } else if (
                !this.readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
            ) {
                /**
                 * destroy the connection if it's in a unwanted idle state for more than 20 sec 
                 */
                this.readyLock = true;
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 30_000);
                } catch{
                    if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed){
                        this.voiceConnection.destroy();
                    }
                } finally {
                    this.readyLock = false;
                }
            }

        });


    // Audio Player
        this.audioPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle){
                oldState.resource.metadata.onFinish();
                this.processQueue();
            } else if (newState.status === AudioPlayerStatus.Playing){
                // If a started playing, then start the new track
                newState.resource.metadata.onStart();
            }
        });

        this.audioPlayer.on('error', (error)=> {
            error.resource.metadata.onError(error);
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

    async processQueue() {
        if (this.queueLock || 
            this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
            this.queue.length === 0){
                return;
        }

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
            return this.processQueue()
        }
    }


    static getNewSubscription(msg){
        if (!msg.member.voice.channelId){
            return false;
        } else {
            let subscription = this.getSubscription(msg);
            if (subscription) {
                return subscription;
            } else {
                return this.createSubcription(msg);
            }
        }
    
    }

    static getSubscription(msg){
        if (!msg.member.voice.channel){
            return false;
        } else {
            let subscription = this.subscriptions.get(msg.guildId);
            if (subscription) {
                return subscription;
            } else {
                return false;
            }   
        }
        
    }

    static createSubcription(msg){
        let subscription = new MusicSubscription(msg.member.voice.channel);
        subscription.voiceConnection.on('error', console.warn);
        this.subscriptions.set(msg.guildId, subscription);
        return this.subscriptions.get(msg.guildId);
    }

    static async killVoice(msg){
        const subscription = this.getSubscription(msg);
    
        if (subscription && msg.member.voice.channel){
            if (subscription.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) subscription.voiceConnection.destroy();

            subscription.stop();
            this.subscriptions.delete(msg.guildId);
        }
    
    }

}