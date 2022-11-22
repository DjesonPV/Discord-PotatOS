import * as DiscordJs from 'discord.js';

import SubscriptionPlaylist from "./SubscriptionPlaylist.mjs";

import * as UTILS from '../Utils.mjs';
import * as LANG from '../../Language.mjs';
import * as MP3Files from "../../../assets/mp3FileList.mjs";
import * as LocalRadio from "../../../assets/localRadioList.mjs";

import ytdl from 'youtube-dl-exec';
import * as RadioGarden from '../RadioGarden.mjs';
import favcolor from 'favcolor';

export default class TrackData {

	/** 
	 * @param {string} url
	 * @param {DiscordJs.Snowflake} snowflake
	 * @param {string} source 
	 * @param {string} query
	 */
	constructor(url, source, query) {
		this.url = url, 
		this.source = source;
		this.query = query;
	}

	/** 
	 * @param {SubscriptionPlaylist} subscription 
	 */
	fetchData(subscription, snowflake) {
		return new Promise( (resolve) => {  // Here we will always resolve, should not fail
			fetchMetadata(this.url, this.source, this.query).then(
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
			name: LANG.musicdisplayerLoading,
			iconURL: LANG.musicdisplayerBotIcon,
		},
		color: LANG.musicdisplayerBotColor,
		description: LANG.musicdisplayerPleaseWait,
		title: ` `,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: LANG.musicdisplayerPlaylistDescriptionLoading,
		playlistTitle: LANG.musicdisplayerLoading,
	};

} // class TrackData


function fetchMetadata(url, source, query) {
	return new Promise ( async (resolve) => {
		//console.log(`URL : ${url}\n Source : ${source} \nQuery : ${query}\n\n`);
		switch (source) {
			case "MP3Sample":
				resolve(fetchMetadataFromFile(query));
			break;
			case "LocalRadio":
				resolve(fetchMetadataFromLocalRadio(url, query));
			break;
			case "RadioGarden":
				resolve(await fetchMetadataFromRadioGarden(url, query));
			break;
			case "YTDLP":
			default:
				resolve(await fetchMetadataFromYTDLP(url, query));
			break;
		};

	});

} // fetchMetadata()
// _____________________________________________________________________________________________________________________

/**
 * Tries to fetch data with yt-dlp if it fails then it fall back to fromInternet
 * @param {string} url 
 * @returns 
 */
async function fetchMetadataFromYTDLP(url, searchQuery) {
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
			}, () => {onError()} );
		} catch (error) {onError();}

		function onError() {
			clearTimeout(timeout);
			reject(url);
		}
	}).then( async metadata => { // Fetched metadata from YTDLP in time

		const authorName = `${metadata.webpage_url_domain} • ${metadata.channel ?? metadata.artist ?? metadata.uploader ?? metadata.creator}`;
		const authorURL = metadata.uploader_url ?? metadata.channel_url ?? metadata.webpage_url;
		const duration = metadata.duration;
		const iconURL = `https://s2.googleusercontent.com/s2/favicons?domain_url=${metadata.webpage_url_domain}&sz=48`;
		const isLive = metadata.is_live;
		const title = metadata.fulltitle || metadata.title;
		const thumbnail = metadata.thumbnail ?? LANG.musicdisplayerDefaultThumbnail;
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

		if (searchQuery === null || searchQuery === undefined) {
			return fetchMetadataFromInternet(url);
		} else {
			return failedYoutubeSearchFetch(url, searchQuery);
		}
	});
} // fetchMetadataFromYTDLP()
// _____________________________________________________________________________________________________________________

/** Fetch data from the MP3Files */
function fetchMetadataFromFile(key) {

	const file = MP3Files.files[key];

	if (file === undefined) {
		throw 'mp3Key undefined';
	}

	return {
		isLive: false,

		// Data used in the MusicDisplayer Embed
		author: {
			name: LANG.musicdisplayerCommandCalledSoundsample(key),
			iconURL: LANG.botIcon,
		},
		color: LANG.musicdisplayerBotColor,
		description: file.description,
		title: file.title,
		thumbnail: file.thumbnail ?? LANG.musicdisplayerDefaultThumbnail,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: LANG.musicdisplayerThroughCommand,
		playlistTitle: key,
	};
} // fetchMetadataFromFile()
// _____________________________________________________________________________________________________________________

/** Fetch data from the filed info from the LocalRadioList */
function fetchMetadataFromLocalRadio(url, key) {

	const radio = LocalRadio.radios[key];

	if (radio === undefined) return fetchMetadataFromInternet(url);

	return {
		isLive: true,

		// Data used in the MusicDisplayer Embed
		author: {
			name: radio.name,
			url: radio.web,
			iconURL: LANG.musicdisplayerRadioIcon,
		},
		color: LANG.musicdisplayerRadioColor,
		description: radio.description,
		title: radio.title,
		url: radio.url,
		thumbnail: radio.thumbnail ?? LANG.musicdisplayerRadioThumbnail,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: radio.title,
		playlistTitle: `🟢 ${radio.name}`,
	};
} // fetchMetadataFromLocalRadio()

// _____________________________________________________________________________________________________________________

/** Try do to something for Internet Files
 * @param {string} url 
 */
async function fetchMetadataFromInternet(url) {

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
		description: LANG.musicdisplayerWebLink,
		title: file,
		url: url,

		// Data used in the MusicDisplayer Playlist SelectMenu
		playlistDescription: url,
		playlistTitle: file,
	};
} // fetchMetadataFromInternet()
// _____________________________________________________________________________________________________________________

/** Fetch Data from Radio Garden */
async function fetchMetadataFromRadioGarden(url, searchQuery) {

	return await RadioGarden.getRadioData(url).then( info => {
		return {
			isLive: true,

			// Data used in the MusicDisplayer Embed
			author: {
				name: `Radio Garden`,
				url: `https://radio.garden${info.url}`,
				iconURL: LANG.musicdisplayerRadioIcon,
			},
			color: LANG.musicdisplayerRadioColor,
			description: `${info.place.title}, ${info.country.title}`,
			title: info.title,
			thumbnail: LANG.musicdisplayerRadioThumbnail,
			url: info.website,

			// Data used in the MusicDisplayer Playlist SelectMenu
			playlistDescription: `Radio Garden • ${info.place.title}, ${info.country.title}`,
			playlistTitle: `🟢 ${info.title}`,
		};

	}, () => {
		return failedRadioGardenFetch(url, searchQuery);
	});
} // fetchMetadataFromRadioGarden()
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
			iconURL: LANG.musicdisplayerRadioIcon,
		},
		color: LANG.musicdisplayerRadioColor,
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
			resolve(LANG.musicdisplayerNoColor);
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
			resolve(LANG.musicdisplayerNoColor);
			return;
		}
	});
} // getColorFromURL()
