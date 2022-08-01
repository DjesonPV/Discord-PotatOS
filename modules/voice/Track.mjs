import * as DiscordJsVoice from '@discordjs/voice';
import * as fs from 'fs';
import ytdl from 'youtube-dl-exec';

import * as MP3Files from "./MP3Files.mjs";


// empty function
const noop = () => { };

export default class Track {
    constructor({ url, metadata, onStart, onFinish, onError }) {
        this.url = url;
        this.metadata = metadata;
        this.volume = 1.0;

        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }

    // Don't ask me it's a copy of the example from discordjs/voice
    createAudioResource() {
        return new Promise((resolve, reject) => {
            if (this.url.startsWith('http')) {
                /**
                 * URL is a link
                 */
                const process = ytdl.exec(
                    this.url,
                    {
                        output: '-',
                        format: 'bestaudio/best',
                        quiet: true,
                    },
                    { stdio: ['ignore', 'pipe', 'ignore'] }

                );

                if (!process.stdout) {
                    reject(new Error('No stdout'));
                    return;
                }
                const stream = process.stdout;

                const onError = (error) => {
                    if (!process.killed) process.kill();
                    stream.resume();
                    reject(error);
                };
                process
                    .once('spawn', () => {
                        DiscordJsVoice.demuxProbe(stream)
                            .then((probe) => resolve(
                                DiscordJsVoice.createAudioResource(probe.stream, {
                                    metadata: this,
                                    inputType: probe.type,
                                    inlineVolume: true
                                })
                            ))
                            .catch(onError);
                    })
                    .catch(onError);
            } else {
                /**
                 * URL is a file
                 */
                try {
                    DiscordJsVoice.demuxProbe(fs.createReadStream(this.url)).then(({ stream, type }) => {
                        const resource = DiscordJsVoice.createAudioResource(stream, {
                            inputType: type,
                            metadata: this,
                            inlineVolume: true
                        });

                        resolve(resource);
                    }).catch(reject);

                } catch (error) {
                    reject(error);
                }

            }
        });

    }

    setVolume(volume) {
        this.volume = volume;
    }

    static fetchData(url, methods) {
        if (url.startsWith(MP3Files.path))
            return fromFile(url, methods);

        return fromYTDLP(url, methods);
    }

}

// ==================================================================================
//  TRACK FROM SOURCES
//

async function fromYTDLP(url, methods) {
    const info  = await ytdl.exec(
        url,
        {
            skipDownload: true,
            addMetadata: true,
            dumpSingleJson: true,
        });

    const parsedInfo = JSON.parse(info.stdout);

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


// ===============================================================================
// WRAPPED METHODS CONSTRUCTOR
//
function define(url, methods, metadata) {

    const wrappedMethods = {
        onStart() {
            wrappedMethods.onStart = noop;
            methods.onStart();
        },
        onFinish() {
            wrappedMethods.onFinish = noop;
            methods.onFinish();
        },
        onError(error) {
            wrappedMethods.onError = noop;
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


// =============================================================================
// UTILITARY FUNCTIONS
//

function getMP3KeyFromURL(url) {
    const key = Object.keys(MP3Files.files).filter(function (k) {
        return MP3Files.files[k].file === url.slice(MP3Files.path.length);
    })[0];

    return key;
}
