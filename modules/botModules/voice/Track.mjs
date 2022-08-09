import * as DiscordJsVoice from '@discordjs/voice';
import * as fs from 'fs';
import * as ChildProcess from 'child_process';

import ytdl from 'youtube-dl-exec';
import { YouTubeLiveStream } from 'ytls';
import * as RadioGarden from '../RadioGarden.mjs';

import * as LANG from '../../Language.mjs';
import * as MP3Files from "./MP3Files.mjs";

export default class Track {
    constructor({ url, metadata, onStart, onFinish, onError }) {
        /**@type {string} */
        this.url = url;
        this.metadata = metadata;
        this.volume = 1.0;

        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }

    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
    //
    createAudioResource() {
        return new Promise(async (resolve, reject) => {
            // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
            // URL is a LINK to a remote file
            if (this.url.startsWith('http')) {

                let fileURL = undefined;
                const radioGardenId = RadioGarden.matchRadioChannelforId(this.url)?.[1];

                // URL is a Radio Garden link
                if (radioGardenId != undefined) {

                    fileURL = RadioGarden.getRadioFlux(radioGardenId);

                // Fetch Media file URL with yt-dlp
                } else {
                    fileURL = (await ytdl.exec(
                        this.url,
                        {
                            format: 'bestaudio.1/bestaudio*.2/best.2',
                            print: 'urls',
                            simulate: true,
                        }
                    ).catch((reason)=>{reject(LANG.ERROR_NO_AUDIO_MEDIA)}))?.stdout;
                }

                if(fileURL === undefined) {
                    this.onFinish();
                    return;
                }
                
                // _____________________________________________________________
                // File is a YouTube Livestream
                if(fileURL.startsWith('https://manifest.googlevideo.com/api/manifest/hls_playlist/')){

                    const stream = new YouTubeLiveStream(async () => {
                        return fileURL;
                    });

                    resolve(probeAndCreateAudioResource(stream, this));
                }
                // _____________________________________________________________
                // File is not a YouTube Livestream
                else { 
                    // Any http|https url with a query string either t or start in seconds
                    const seekTime = Math.floor(this.url.match(/https?:\/\/.*?\/.*?(?:\?|\&)(?:t|start)=(\d+)s?/)?.[1]) ?? 0;

                    const ffmpegArgs = [
                        '-reconnect', '1',
                        '-reconnect_streamed', '1',
                        '-reconnect_delay_max', '5',
                    ].concat(seekTime > 0 ?[
                        '-ss', `${seekTime}`
                    ]:[]).concat([
                        '-i', fileURL,
                        '-analyzeduration', '0',
                        '-loglevel', '0',
                        '-ar', '48000',
                        '-ac', '2',
                        '-f', 'opus',
                        '-acodec', "libopus",
                        'pipe:1'
                    ]);

                    const process = ChildProcess.spawn('ffmpeg', ffmpegArgs, { windowsHide: true, shell: false });
                    const stream = process.stdout;

                    if (!stream) {
                        reject(LANG.ERROR_NO_STREAM);
                        this.onFinish();
                        return;
                    }

                    try {
                        process.once('spawn', () => {
                            resolve(probeAndCreateAudioResource(stream, this));
                        });
                    } catch (error) {
                        if (!process.killed) process.kill();
                        stream.resume();
                        reject(error);
                    }
                }
            } 
            // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
            // URL is a local file
            else { 
                resolve(probeAndCreateAudioResource(fs.createReadStream(this.url), this));
            }
        });
    }
    // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    setVolume(volume) {
        this.volume = volume;
    }

    static async fetchData(url, methods) {
        if (url.startsWith(MP3Files.path)) {
            return fromFile(url, methods);
        } else if (RadioGarden.matchRadioChannelforId(url) != null) {
            return await fromRadioGarden(url, methods);
        } else {
            return await fromYTDLP(url, methods);
        }
    }

}

async function probeAndCreateAudioResource(readableStream, thisTrack) {
    const probe = await DiscordJsVoice.demuxProbe(readableStream);

    return DiscordJsVoice.createAudioResource(probe.stream, {
        metadata: thisTrack,
        inputType: probe.type,
        inlineVolume: true,
    });    
}

// =====================================================================================================================
//  TRACK FROM SOURCES
//

async function fromYTDLP(url, methods) {

    // Fetch data from yt-dlp in less than 5 seconds or nothing
    const info  = await new Promise ((resolve) => {
        setTimeout(() => {
            resolve(undefined);
            return;
        }, 5000);

        try {
            ytdl.exec(
                url, {
                    embedMetadata: true,
                    noEmbedChapters: true,
                    noEmbedInfoJson: true,
                    simulate: true,
                    dumpSingleJson: true,
                }
            ).then(data => resolve(data));
        } catch (error) {
            resolve(undefined);
            return;
        }
    });

    const parsedInfo = JSON.parse(info?.stdout ?? `{"extractor":"generic"}`);

    if (parsedInfo.extractor !== 'generic'){
        const metadata = {
            isYoutube: true,    // !
            isFile: false,      // !
            isRadio: false,   // !

            // Data use in the MusicDsiplayer Embed
            title: parsedInfo.fulltitle || parsedInfo.title,
            author: `${parsedInfo.webpage_url_domain} • ${parsedInfo.channel ?? parsedInfo.artist ?? parsedInfo.uploader ?? parsedInfo.creator}`,
            duration: parsedInfo.duration,
            thumbnail: parsedInfo.thumbnail,
            url: parsedInfo.webpage_url,
            favicon: `https://s2.googleusercontent.com/s2/favicons?domain_url=${parsedInfo.webpage_url_domain}&sz=48`,
            authorURL: parsedInfo.uploader_url ?? parsedInfo.channel_url ?? parsedInfo.webpage_url,
            uploadDate: parsedInfo.upload_date,
            viewCount: parsedInfo.view_count,
            isLive: parsedInfo.is_live,
        };

        return define(url, methods, metadata);
    }
    else return fromInternet(url, methods);
}

/** Fetch data from the MP3Files */
function fromFile(url, methods) {

    const mp3Key = getMP3KeyFromURL(url);

    const metadata = {
        isYoutube: false, // !
        isFile: true,     // !
        isRadio: false,   // !

        // Data use in the MusicDisplayer Embed
        title: MP3Files.files[mp3Key].title,
        description: MP3Files.files[mp3Key].description,
        key: mp3Key,
    };

    return define(url, methods, metadata);
}

/** Try do to something for Internet Files */
function fromInternet(url, methods) {

    const uri = url.split('/').filter(Boolean); //Split an url and remove empty strings

    const metadata = {
        isYoutube: false, // !
        isFile: false,    // !
        isRadio: false,   // !

        // Data use in the MusicDisplayer Embed
        source: uri[1],
        file: uri[uri.length - 1],
        url: url,
        favicon: `https://s2.googleusercontent.com/s2/favicons?domain_url=${url}&sz=48`
    };

    return define(url, methods, metadata);
}

/** Fetch Data from Radio Garden */
async function fromRadioGarden(url, methods) {

    const info = await RadioGarden.getRadioData(url).catch((error) => {return null;})

    if (info) {

        const metadata = {
            isYoutube: false, // !
            isFile: false,    // !
            isRadio: true,    // !

            // Data use in the MusicDisplayer Embed
            name: info.title,
            url: `https://radio.garden${info.website}`,
            website: info.website,
            place: info.place.title,
            country: info.country.title,
        };

        return define(url, methods, metadata);
    }
    else return fromInternet(url, methods);
}


// =====================================================================================================================
// WRAPPED METHODS CONSTRUCTOR
//
function define(url, methods, metadata) {

    const wrappedMethods = {
        onStart() {
            wrappedMethods.onStart = () => {;};
            methods.onStart();
        },
        onFinish() {
            wrappedMethods.onFinish = () => {;};
            methods.onFinish();
        },
        onError(error) {
            wrappedMethods.onError = () => {;};
            methods.onError(error);
        },
    };

    return new Track({
        url,
        metadata: metadata,
        ...wrappedMethods,
    }
    )
}


// =====================================================================================================================
// UTILITARY FUNCTIONS
//

function getMP3KeyFromURL(url) {
    const key = Object.keys(MP3Files.files).filter(function (k) {
        return MP3Files.files[k].file === url.slice(MP3Files.path.length);
    })[0];

    return key;
}
