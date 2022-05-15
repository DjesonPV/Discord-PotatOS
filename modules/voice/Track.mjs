import ytdlCore from 'ytdl-core';
import { createAudioResource, demuxProbe } from '@discordjs/voice';
import {createReadStream} from 'fs';
import ytdl from 'youtube-dl-exec';

import {MP3Files, MP3Path} from "./MP3Files.mjs";


// empty function
const noop = () => {};

export class Track{
    constructor({url, metadata, onStart, onFinish, onError}){
        this.url = url;
        this.metadata = metadata;
        this.volume = 1.0;

        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }

    // Don't ask me it's a copy of the example from discordjs/voice
    createAudioResource(){
        return new Promise((resolve, reject) => {
            if(this.url.startsWith('http')) {
                /**
                 * URL is a link
                 */
                const process = ytdl.exec(
                    this.url,
                    {
                        o: '-',
                        q: '',
                        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                        r: '100K',
                    },
                    { stdio: ['ignore', 'pipe', 'ignore']},
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
                        demuxProbe(stream)
                            .then((probe) => resolve(
                                createAudioResource(probe.stream, { 
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
                    demuxProbe(createReadStream(this.url)).then(({ stream, type }) => {
                        const resource = createAudioResource(stream, {
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

    setVolume(vol){
        this.volume = vol;
    }
    
    static fetchData(url, methods){

        if (isItAYTLink(url))
        return fromYoutube(url, methods);
       
        if (url.startsWith(MP3Path))
        return fromFile(url, methods);
        
        return fromInternet(url, methods);
    }

}

// ==================================================================================
//  TRACK FROM SOURCES
//



/** Fetch data from YouTube */
async function fromYoutube(url, methods){
    const info = await ytdlCore.getInfo(url);

    const metadata = {
        isYoutube       : true,     // Flags : important to set them
        isFile          : false,    // for code stability

        // Data use in the MusicPlayer Embed
        title           : info.videoDetails.title,
        author          : info.videoDetails.ownerChannelName,
        duration        : info.videoDetails.lengthSeconds,
        videoThumbnail  : ((info.videoDetails.thumbnails[0].url).split('?'))[0],
        videoURL        : info.videoDetails.video_url,
        authorPicture   : ((info.videoDetails.author.thumbnails[0].url).split('='))[0],
        authorURL       : info.videoDetails.author.channel_url,
        uploadDate      : info.videoDetails.uploadDate,
        viewCount       : info.videoDetails.viewCount,
    };

    return define(url, methods, metadata);
}

/** Fetch data from the MP3Files */
function fromFile(url, methods){

    const mp3Key = getMP3KeyFromURL(url);
    
    const metadata = {
        isYoutube       : false,    // Flags : important to set them
        isFile          : true,     // for code stability

        // Data use in the MusicPlayer Embed
        title : MP3Files[mp3Key].title,
        key   : mp3Key,
    };

    return define(url, methods, metadata);
}

/** Try do to something for Internet Files */
function fromInternet(url, methods){

    const uri = url.split('/').filter(Boolean); //Split an url and remove empty strings
    
    const metadata = {
        isYoutube       : false,    // Flags : important to set them
        isFile          : false,    // for code stability

        // Data use in the MusicPlayer Embed
        source : uri[1],
        file   : uri[uri.length-1],
        url : url,
    };

    return define(url, methods, metadata);
}


// ===============================================================================
// WRAPPED METHODS CONSTRUCTOR
//
function define(url, methods, metadata){

    const wrappedMethods = {
        onStart() {
            wrappedMethods.onStart = noop;
            methods.onStart();
        },
        onFinish(){
            wrappedMethods.onFinish = noop;
            methods.onFinish();
        },
        onError(error){
            wrappedMethods.onError = noop;
            methods.onError(error);
        },
    };

    return new Track({
        url,
        metadata : metadata,
        ...wrappedMethods,
        }
    )
}


// =============================================================================
// UTILITARY FUNCTIONS
//
function isItAYTLink(url){
    if (typeof url == "string"){
        if(url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)){
            return true;
        }
    }
    return false;
}

function getMP3KeyFromURL(url){
    const key = Object.keys(MP3Files).filter(function(k) {
        return MP3Files[k].file === url.slice(MP3Path.length);
      })[0];

      return key;
}
