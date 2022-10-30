import fetch from "node-fetch";
import * as LANG from '../Language.mjs';

/** @param {string} query */
export async function searchForRadioUrl(query) {
    try {
        /** @type {string} */
        const url = (await (await fetch(`https://radio.garden/api/search?q=${encodeURIComponent(query)}`)).json())
        ?.hits?.hits
        ?.find((hit) => hit?._source?.type === 'channel')
        ?._source?.url;

        if (url !== undefined) return url;
        else throw "Undefined URL";

    } catch (error) {
        return Promise.reject(`RadioGarden: Failed to find Radio URL`);
    }
}

/** @param {string} url */
export async function getRadioData(url){
    const radioChannelId = matchRadioChannelforId(url)?.[1];
    if (radioChannelId !== undefined){
        const channel = await (await fetch(`https://radio.garden/api/ara/content/channel/${radioChannelId}`)).json()
        return channel.data;
    }
    else {
        return Promise.reject(`RadioGarden: Invalid URL`);
    }
}

/** @param {string} radioChannelId */
export function getRadioFlux(radioChannelId){
    if (radioChannelId !== undefined) {
        return `https://radio.garden/api/ara/content/listen/${radioChannelId}/channel.mp3`;
    } else {
        return undefined;
    }
}

/** @param {string} url */
export function matchRadioChannelforId(url){
    return url.match(/^https?:\/\/radio\.garden\/listen\/(?:[^\/]+)\/([^\/]+)$/);
}
