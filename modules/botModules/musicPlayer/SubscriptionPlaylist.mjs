import * as NodeEvents from 'node:events';

import * as DiscordJs from 'discord.js';
import * as DiscordJsVoice from '@discordjs/voice';

import AudioTrack from './AudioTrack.mjs';
import TrackData from './TrackData.mjs';

/**
 * @typedef Track
 * @property {DiscordJs.Snowflake} id
 * @property {string} url
 * @property {number} volume
 * @property {DiscordJsVoice.AudioResource} audio Promise asynchronously resolved
 * @property {{
 *   isLive: boolean,
 *   author: DiscordJs.EmbedAuthorOptions,
 *   color: string,
 *   description: string,
 *   title: string,
 *   thumbnail?: string,
 *   url?: string,
 *   playlistDescription: string,
 *   playlistTitle: string,
 * }} data Promise asynchronously resolved
 * @property {string | null} query
 * @property {boolean} live
 * @property {boolean} failed
*/

/**
 * @typedef CuratedTrackData
 * @property {DiscordJs.Snowflake} id
 * @property {{
 *   isLive: boolean,
 *   author: DiscordJs.EmbedAuthorOptions,
 *   color: string,
 *   description: string,
 *   title: string,
 *   thumbnail?: string,
 *   url?: string,
 *   playlistDescription: string,
 *   playlistTitle: string,
 * }} data
 * @property {boolean} failed
*/

export default class SubscriptionPlaylist extends NodeEvents.EventEmitter{

    
    /** @type {Array<Track>} */
    playlist = [];
    #lock = false;

    constructor() {
        super();

        this.on('audioReady', (audio) => {
            if (this.current?.audio !== undefined) {
                this.current.audio = audio;
                this.current.audio.volume.setVolume(this.current.volume);
            }
            this.emit('audioPlay');
        });

        this.on('audioFail', () => {
            if (this.current?.audio !== undefined) {
                this.current.failed = true;
            }
            this.emit('audioPlay');
        });

        this.on('dataReady', (id, data) => {
            const track = trackInPlaylist(this.playlist, id);
            if (track?.data !== undefined) {
                track.data = data;
            }
            if (track?.live !== undefined) {
                track.live = track.data.isLive;
            }
            this.emit('dataShow');
        });

    }

    lock() { this.#lock = true; }
    unlock() { this.#lock = false; }
    isLocked(){ return this.#lock; }

    add(url, snowflake, volume, query = null) {
        this.lock();
        this.playlist.push({
            id: snowflake, 
            url: url,
            volume: volume,
            audio: null,
            data: new TrackData(url).fetchData(this, snowflake, query),
            query: query,
            live: true,
            failed: false,
        });
        this.emit('playlistChanged');
        this.unlock();
    }

    replaceCurrent(url, snowflake, volume) {
        this.lock();
        this.current = {
            id: snowflake, 
            url: url,
            volume: volume,
            audio: null,
            data: new TrackData(url).fetchData(this, snowflake, null),
            query: null,
            live: true,
            failed: false,
        };
        this.emit('playlistChanged');
        this.unlock();
    }

    remove(snowflake) {
        this.lock();
        const index = indexInPlaylist(this.playlist, snowflake);

        if(index > 0) { // can't remove playing track
            this.playlist.splice(index, 1);
            this.emit('playlistChanged');
            this.unlock();
            return true;
        } else {
            this.unlock();
            return false;
        }
    }

    moveTop(snowflake) {
        this.lock();
        const index = indexInPlaylist(this.playlist, snowflake);

        if(index > 1) { // can't move playing track or first of playlist
            // move selected index to index 1
            this.playlist.splice(1, 0, ...this.playlist.splice(index, 1));
            this.emit('playlistChanged');
            this.unlock();
            return true;
        } else {
            this.unlock();
            return false;
        }
    }

    next() {
        this.lock();
        this.playlist.shift();
        this.unlock();
    }

    fetchCurrentAudio() {
        this.current.audio = new AudioTrack(this.current.url).fetchAudio(this);
    }

    get current() {
        return this.playlist[0];
    }

    set current(value) {
        this.playlist[0] = value;
    }

    isEmpty() {
        return (this.playlist.length == 0);
    }

    hasQueue() {
        return (this.playlist.length > 1);
    }


    kill() { // nuke this
        this.removeAllListeners();
        this.playlist = [];
    }

    getCuratedDataPlaylist() {
        /** @type {Array<CuratedTrackData>} */
        let curratedDataPlaylist = [];

        this.playlist.forEach(track => {
            let data = {};

            if (track.data.author !== undefined) { // Test if Promise is finished
                data = track.data;
            } else {
                data = TrackData.loadingData;
                if (track.query !== null) data.title = track.query;
                else data.title = track.url;
                data.url = track.url;
            }

            curratedDataPlaylist.push({
                id: track.id,
                data: data,
                failed: track.failed,
            })
        });

        return curratedDataPlaylist;
    }

}

/**
 * @param {Array<{
 *  id: DiscordJs.Snowflake,
 *  audio: Promise
 *  data: Promise,
 *  query: string,
 * }>} playlist 
 * @param {DiscordJs.Snowflake} id 
 */
function indexInPlaylist(playlist, id) {
    return playlist.findIndex(track => track.id === id);
}

/**
 * @param {Array<Track>} playlist 
 * @param {DiscordJs.Snowflake} id 
 */
function trackInPlaylist(playlist, id) {
    return playlist.find(track => track.id === id);
}
