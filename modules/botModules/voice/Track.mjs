import * as DiscordJsVoice from '@discordjs/voice';
import * as fs from 'fs';
import ytdl from 'youtube-dl-exec';
import { YouTubeLiveStream } from 'ytls';

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
                // Fetch Media file URL
                const fileURL = (await ytdl.exec(
                    this.url,
                    {
                        format: 'bestaudio/bestaudio*',
                        getUrl : true,
                    }
                ).catch((reason)=>{reject(LANG.ERROR_NO_AUDIO_MEDIA)}))?.stdout;

                if(!fileURL) {
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
                    const process = ytdl.exec(
                        fileURL,
                        {
                            output: '-',
                            format : 'bestaudio/bestaudio*',
                        },
                        { stdio: ['ignore', 'pipe', 'ignore'] }
                    );
    
                    const stream = process.stdout;

                    if (!stream) {
                        reject(LANG.ERROR_NO_STREAM);
                        this.onFinish();
                        return;
                    }

                    process
                        .once('spawn', () => {
                            resolve(probeAndCreateAudioResource(stream, this));
                        })
                        .catch((error) => {
                            if (!process.killed) process.kill();
                            stream.resume();
                            reject(error);
                        })
                    ;
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

    static fetchData(url, methods) {
        if (url.startsWith(MP3Files.path))
            return fromFile(url, methods);

        return fromYTDLP(url, methods);
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
    const info  = await ytdl.exec(
        url,
        {
            skipDownload: true,
            addMetadata: true,
            dumpSingleJson: true,
        }).catch(error => {;});

    const parsedInfo = JSON.parse(info?.stdout ?? `{"extractor":"generic"}`);

    if (parsedInfo.extractor !== 'generic'){
        const metadata = {
            isYoutube: true,    // !
            isFile: false,      // !

            // Data use in the MusicPlayer Embed
            title: parsedInfo.fulltitle || parsedInfo.title,
            author: `${parsedInfo.extractor_key} • ${parsedInfo.channel ?? parsedInfo.artist ?? parsedInfo.uploader}`,
            duration: parsedInfo.duration,
            videoThumbnail: parsedInfo.thumbnail,
            videoURL: parsedInfo.webpage_url,
            authorPicture: `https://s2.googleusercontent.com/s2/favicons?domain_url=${parsedInfo.webpage_url_domain}&sz=48`,
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

        // Data use in the MusicPlayer Embed
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

        // Data use in the MusicPlayer Embed
        source: uri[1],
        file: uri[uri.length - 1],
        url: url,
    };

    return define(url, methods, metadata);
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
