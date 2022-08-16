import * as DiscordJs from 'discord.js';

import SubscriptionPlaylist from "./SubscriptionPlaylist.mjs";

import * as UTILS from '../Utils.mjs';
import * as LANG from '../../Language.mjs';
import * as MP3Files from "../MP3Files.mjs";

import ytdl from 'youtube-dl-exec';
import * as RadioGarden from '../RadioGarden.mjs';
import favcolor from 'favcolor';

export default class TrackData {

	/** @param {string} url */
	constructor(url) {
		this.url = url
	}

	/** 
	 * @param {SubscriptionPlaylist} subscription 
	 * @param {DiscordJs.Snowflake} snowflake
	 * @param {string} searchQuery
	 */
	fetchData(subscription, snowflake, searchQuery) {
		return new Promise( (resolve) => {  // Here we will always resolve, should not fail
			fetchMetadata(this.url, searchQuery).then(
				(metadata) => {
					resolve(true);
					subscription.emit('dataReady', snowflake, metadata);
				},
			);
		});
	} // fetchData()

	static loadingData = {
		isLive: true,

		// Data used in the MusicDisplayer Embed
		author: {
			name: LANG.MUSICDISPLAYER_LOADING,
			iconURL: LANG.MUSICDISPLAYER_BOT_ICON,
		},
		color: LANG.MUSICDISPLAYER_BOT_COLOR,
		description: LANG.MUSICDISPLAYER_LOADING_PLEASE_WAIT,
		title: ` `,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: LANG.MUSICDISPLAYER_LOADING_PLAYLIST_DESC,
		playlistTitle: LANG.MUSICDISPLAYER_LOADING,
	};

} // class TrackData

function fetchMetadata(url, searchQuery) {
	return new Promise ( async (resolve) => { // will always return something
		if (url.startsWith(MP3Files.path)) { // it is LocalFile
			resolve(fetchMetadatafromFile(url));
		} else if (RadioGarden.matchRadioChannelforId(url) != null) {
			resolve(await fetchMetadatafromRadioGarden(url, searchQuery));
		} else {
			resolve(await fetchMetadatafromYTDLP(url, searchQuery));
		} // fi
	});
} // fetchMetadata()
// _____________________________________________________________________________________________________________________

/**
 * Tries to fetch data with yt-dlp if it fails then it fall back to fromInternet
 * @param {string} url 
 * @returns 
 */
async function fetchMetadatafromYTDLP(url, searchQuery) {
	return await new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
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
			).then(async data => {
				clearTimeout(timeout);
				const metadata = JSON.parse(data.stdout);

				if (metadata.extractor === 'generic') {
					reject(url);
				} else {
					resolve(metadata);
				}
			});
		} catch (error) {
			clearTimeout(timeout);
			reject();
			return;
		}
	}).then( async metadata => { // Fetched metadata from YTDLP in time

		const authorName = `${metadata.webpage_url_domain} • ${metadata.channel ?? metadata.artist ?? metadata.uploader ?? metadata.creator}`;
		const authorURL = metadata.uploader_url ?? metadata.channel_url ?? metadata.webpage_url;
		const duration = metadata.duration;
		const iconURL = `https://s2.googleusercontent.com/s2/favicons?domain_url=${metadata.webpage_url_domain}&sz=48`;
		const isLive = metadata.is_live;
		const title = metadata.fulltitle || metadata.title;
		const thumbnail = metadata.thumbnail ?? LANG.MUSICDISPLAYER_DEFAULT_THUMBNAIL;
		const uploadDate = metadata.upload_date;
		const url = metadata.webpage_url;
		const viewCount = metadata.view_count;

		return {
			isLive: isLive,

			// Data use in the MusicDisplayer Embed
			author: {
				name: authorName,
				iconURL: iconURL,
				url: authorURL,
			},
			color: await getColorFromURL(url),
			description: `${isLive ? `🔴 LIVE` : UTILS.durationToString(duration)} • ${UTILS.viewsToString(viewCount)} • ${UTILS.YYYYMMDDToString(uploadDate)}`,
			title: title,
			thumbnail: thumbnail,
			url: url,

			// Data used in the MusicDisplayer Playlist SelectMenu
			playlistDescription: `${authorName} • ${isLive ? `⬤ LIVE` : UTILS.durationToString(duration)} • ${UTILS.viewsToString(viewCount)} • ${UTILS.YYYYMMDDToString(uploadDate)}`,
			playlistTitle: title,
		};

	}, () => { // Failed to get metadata from YTDLP

		if (searchQuery === undefined) {
			return fetchMetadatafromInternet(url);
		} else {
			return failedYoutubeSearchFetch(url, searchQuery);
		}
	});
} // fetchMetadatafromYTDLP()
// _____________________________________________________________________________________________________________________

/** Fetch data from the MP3Files */
function fetchMetadatafromFile(url) {

	const mp3Key = Object.keys(MP3Files.files).find(key => MP3Files.files[key].file === url.slice(MP3Files.path.length));

	if(mp3Key === undefined) {
		throw 'mp3Key undefined';;
	}
	

	/** @type {string} */ const title = MP3Files.files[mp3Key].title;
	/** @type {string} */ const description = MP3Files.files[mp3Key].description;

	return {
		isLive: false,

		// Data used in the MusicDisplayer Embed
		author: {
			name: LANG.MUSICDISPLAYER_COMMAND_CALLED_SOUND(mp3Key),
			iconURL: LANG.MUSICDISPLAYER_BOT_ICON,
		},
		color: LANG.MUSICDISPLAYER_BOT_COLOR,
		description: description,
		title: title,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: LANG.MUSICDISPLAYER_THROUGH_COMMAND,
		playlistTitle: mp3Key,
	};
} // fetchMetadatafromFile()
// _____________________________________________________________________________________________________________________

/** Try do to something for Internet Files
 * @param {string} url 
 */
async function fetchMetadatafromInternet(url) {

	/** @type {string} */ const uri = url.split('/').filter(Boolean); //Split an url and remove empty strings
	/** @type {string} */ const source = uri[1];
	/** @type {string} */ const file = uri[uri.length - 1];
	const favicon = `https://s2.googleusercontent.com/s2/favicons?domain_url=${uri}&sz=48`;

	return {
		isLive: false,

		// Data used in the MusicDisplayer Embed
		author: {
			name: source,
			url: `https://${source}`,
			iconURL: favicon,
		},
		color: await getColorFromURL(uri),
		description: LANG.MUSICDISPLAYER_WEB_LINK,
		title: file,
		url: url,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: url,
		playlistTitle: file,
	};
} // fetchMetadatafromInternet()
// _____________________________________________________________________________________________________________________

/** Fetch Data from Radio Garden */
async function fetchMetadatafromRadioGarden(url, searchQuery) {

	return await RadioGarden.getRadioData(url).then( info => {
		return {
			isLive: true,

			// Data used in the MusicDisplayer Embed
			author: {
				name: `Radio Garden`,
				url: `https://radio.garden${info.url}`,
				iconURL: LANG.MUSICDISPLAYER_RADIO_ICON,
			},
			color: LANG.MUSICDISPLAYER_RADIO_COLOR,
			description: `${info.place.title}, ${info.country.title}`,
			title: info.title,
			thumbnail: LANG.MUSICDISPLAYER_RADIO_THUMBNAIL,
			url: info.website,

			// Data used in the MusicDisplayer Playlist SelectMenu
			playlistDescription: `Radio Garden • ${info.place.title}, ${info.country.title}`,
			playlistTitle: `🟢 ${info.title}`,
		};

	}, () => {
		return failedRadioGardenFetch(url, searchQuery);
	});
} // fetchMetadatafromRadioGarden()
// _____________________________________________________________________________________________________________________

/**
 * @param {string} url 
 * @param {string} searchQuery 
 */
function failedYoutubeSearchFetch(url, searchQuery) {
	return {
		isLive: true,

		// Data used in the MusicDisplayer Embed
		author: {
			name: `YouTube`,
			url: `https://www.youtube.com/`,
			iconURL: `https://s2.googleusercontent.com/s2/favicons?domain_url=youtube.com&sz=48`,
		},
		color: '#FF0000',
		description: searchQuery,
		title: url,
		url: url,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: searchQuery,
		playlistTitle: `YouTube ○ /${url.match(/https:\/\/www\.youtube\.com\/([^&]+)/)?.[1] ?? ''}`,
	};

} // failedYoutubeSearchFetch()
// _____________________________________________________________________________________________________________________

/**
 * @param {string} url 
 * @param {string} searchQuery 
 */
function failedRadioGardenFetch(url, searchQuery) {
	return {
		isLive: true,

		// Data used in the MusicDisplayer Embed
		author: {
			name: `Radio Garden`,
			url: `https://radio.garden/`,
			iconURL: LANG.MUSICDISPLAYER_RADIO_ICON,
		},
		color: LANG.MUSICDISPLAYER_RADIO_COLOR,
		description: searchQuery,
		title: url,
		url: url,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: `Radio Garden ○ ${searchQuery}`,
		playlistTitle: `🟢 /${url.match(/https?:\/\/radio\.garden\/([^&]+)/)?.[1] ?? ''}`,
	};

} // failedRadioGardenFetch()
// _____________________________________________________________________________________________________________________

/**
 * // Fetch coulor in less than half a second of use default
 * @param {string} url 
 * @returns {Promise<string>} Formatted like '#000000'
 */
function getColorFromURL(url) {
	return new Promise((resolve) => {
		const timeout = setTimeout(() => {
			resolve(LANG.MUSICDISPLAYER_WEB_COLOR);
			return;
		}, 500);

		try {
			favcolor.fromSiteFavicon(url.match(/(?:http|https):\/\/(?:[^\/])+\//)[0])
			.then(color => {
				clearTimeout(timeout);    
				resolve(color.toHex());
			});
		} catch (error) {
			clearTimeout(timeout);
			resolve(LANG.MUSICDISPLAYER_WEB_COLOR);
			return;
		}
	});
} // getColorFromURL()
