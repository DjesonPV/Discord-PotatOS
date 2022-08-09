import Axios from 'axios';
import * as LANG from '../Language.mjs';

/** @param {string} query */
export async function searchForRadioUrl(query) {
    try {
        /** @type {string} */
        const url = (await Axios.get(`https://radio.garden/api/search?q=${encodeURIComponent(query)}`))?.data
        ?.hits?.hits
        ?.find((hit) => {
            return (hit?._source?.type === 'channel');
        })
        ?._source?.url;

        if (url !== undefined) return url;
        else throw "Undefined URL";

    } catch (error) {
        return Promise.reject(`RadioGarden: Failed to find Radio URL`);
    }
}

/** @param {string} url */
export async function getRadioData(url){
    const channelId = url.match(/\/listen\/(?:[^\/]+)\/([^\/]+)/)?.[1];

    if (channelId !== undefined){
        const channel = await Axios.get(`https://radio.garden/api/ara/content/channel/${channelId}`);
        return channel?.data?.data;
    }
    else {
        return Promise.reject(`RadioGarden: Invalid URL`);
    }
}

export function getRadioFlux(channelId){
    return `https://radio.garden/api/ara/content/listen/${channelId}/channel.mp3`
}
