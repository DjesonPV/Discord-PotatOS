import * as DiscordJsVoice from '@discordjs/voice';
import * as DiscordJs from "discord.js";

import SubscriptionPlaylist from "./SubscriptionPlaylist.mjs";

import * as UTILS from '../Utils.mjs';
import * as LANG from '../../Language.mjs';

import * as fs from 'fs';
import * as ChildProcess from 'child_process';

import ytdl from 'youtube-dl-exec';
import { YouTubeLiveStream } from 'ytls';
import * as RadioGarden from '../RadioGarden.mjs';


export default class AudioTrack {

    constructor(url) {
        this.url = url
    }

    /** @param {SubscriptionPlaylist} subscription */
    fetchAudio(subscription) {
        return new Promise( (resolve) => {  // Here we will always resolve, but will emit a fail so the subscription will not 
            createAudioResource(this.url).then(
                (audioRessource) => {
                    resolve(true);
                    subscription.emit('audioReady', audioRessource);
                },
                (reason) => {
                    resolve(true);
                    subscription.emit('audioFail');
                }
            );
        });
    }
} // class AudioTrack

/** @param {string} url */
async function createAudioResource(url) {
    return new Promise(async (resolve, reject) => {
        if (UTILS.isItAnURL(url)) {
            fetchFileURL(url).then( fileURL => {
                if (fileURL === undefined) {
                    reject(LANG.ERROR_NO_AUDIO_MEDIA)
                    return;
                }

                if (isUrlAYoutubeLivestream(fileURL)) {
                    const stream = new YouTubeLiveStream(() => { return fileURL; });
                    resolve(probeAndCreateAudioResource(stream));

                } else { // !isUrlAYoutubeLivestream(fielURL)
                    const process = ChildProcess.spawn('ffmpeg', buildFFmpegArgs(url, fileURL), { windowsHide: true, shell: false });
                    const stream = process.stdout;

                    if (!stream) {
                        reject(LANG.ERROR_NO_STREAM);
                        return;
                    }

                    try {
                        process.once('spawn', () => {
                            resolve(probeAndCreateAudioResource(stream));
                        });
                    } catch (error) {
                        if (!process.killed) process.kill();
                        stream.resume();
                        reject(error);
                    }
                }
            }, () => { reject()});
        } else { // !UTLIS.isItAnURL()
            resolve(probeAndCreateAudioResource(fs.createReadStream(url)));
        }
    });
} // createAudioRessource()

async function probeAndCreateAudioResource(readableStream) {
    return DiscordJsVoice.demuxProbe(readableStream).then(probe => {
        return DiscordJsVoice.createAudioResource(probe.stream, {
            inputType: probe.type,
            inlineVolume: true,
        });
    });
}

/**
 * @param {string} queryURL 
 * @returns {Promise<string | undefined>}
 */
async function fetchFileURL(queryURL) {
    return new Promise(async (resolve, reject) => {

        const radioGardenURL = RadioGarden.getRadioFlux(RadioGarden.matchRadioChannelforId(queryURL)?.[1]);

        if (radioGardenURL !== undefined) {
            resolve (radioGardenURL)
        } else {
            let ytdlURL;
            try {
                ytdlURL = (await ytdl.exec(
                    queryURL,
                    {
                        format: 'bestaudio.1/bestaudio*.2/best.2',
                        print: 'urls',
                        simulate: true,
                    }
                ))?.stdout;
            } catch (error) {
                reject('Unsuported URL');
            }
            
            if (ytdlURL !== undefined) resolve(ytdlURL)
            else reject('YTDLP returned no URL');
        }
    });
} // fetchFileURL()

/** @param {string} url */
function isUrlAYoutubeLivestream(url) {
    return url.startsWith('https://manifest.googlevideo.com/api/manifest/hls_playlist/')
}

/** 
 * @param {string} queryURL 
 * @param {string} fileURL
 * */
function buildFFmpegArgs(queryURL, fileURL) {
    // Any http|https url with a query string either t or start in seconds
    const seekTime = Math.floor(queryURL.match(/https?:\/\/.*?\/.*?(?:\?|\&)(?:t|start)=(\d+)s?/)?.[1]) ?? 0;

    return [
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5',
    ].concat(seekTime > 0 ? [
        '-ss', `${seekTime}`
    ] : []).concat([
        '-i', fileURL,
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-ar', '48000',
        '-ac', '2',
        '-f', 'opus',
        '-acodec', "libopus",
        'pipe:1'
    ]);
}
