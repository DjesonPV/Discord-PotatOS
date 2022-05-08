import ytdlCore from 'ytdl-core';
import { createAudioResource, demuxProbe } from '@discordjs/voice';
import ytdl from 'youtube-dl-exec';

// empty function
const noop = () => {};

export class Track{
    constructor({url, metadata, onStart, onFinish, onError}){
        this.url = url;
        this.metadata = metadata;

        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }

    createAudioResource(){
        return new Promise((resolve, reject) => {
            if(this.url.startsWith('http')) {
                const process = ytdl.exec(
                    this.url,
                    {
                        o: '-',
                        q: '',
                        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                        r: '100K',
                    },
                    { stdio: ['ignore', 'pipe', 'ignore'] },
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
                            .then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type, inlineVolume: true })))
                            .catch(onError);
                    })
                    .catch(onError);
            } else {
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


    static async from(url, methods){

        const metadata = {
            isYoutube       :false, 
            title           : "Inconnu",
            author          : "Inconnu",
            duration        : 0,
            videoThumbnail  : "",
            videoURL        : "",
            authorPicture   : "",
            authorURL       : "",
            uploadDate      : "",
            viewCount       : "",
        };

        const info = await ytdlCore.getInfo(url);

        metadata.title = info.videoDetails.title;
        metadata.author = info.videoDetails.ownerChannelName;
        metadata.videoThumbnail = `https://i.ytimg.com/vi_webp/${info.videoDetails.videoId}/maxresdefault.webp`;
        metadata.videoURL = info.videoDetails.video_url;
        metadata.authorPicture = ((info.videoDetails.author.thumbnails[0].url).split('='))[0];
        metadata.authorURL = info.videoDetails.author.channel_url;
        metadata.duration = info.videoDetails.lengthSeconds;
        metadata.uploadDate = info.videoDetails.uploadDate;
        metadata.viewCount = info.videoDetails.viewCount;
        metadata.isYoutube = true;


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



}