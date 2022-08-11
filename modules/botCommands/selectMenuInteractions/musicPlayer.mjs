import * as DiscordJs from 'discord.js';
import * as UTILS from '../../botModules/Utils.mjs';
import * as LANG from '../../Language.mjs';
import displayMusicDisplayer from "../../botModules/MusicDisplayer.mjs";
import MusicSubscription from '../../botModules/voice/MusicSubscription.mjs';

/** @param {DiscordJs.SelectMenuInteraction} interaction */
function commandPlaylist(interaction) {
    const subscription = MusicSubscription.getSubscription(interaction.guild.id);
    if (subscription === undefined) {
        interaction.deferUpdate();
        return;
    }

    const selected = interaction.values[0];
    const trackList = [subscription.currentTrack, ...subscription.queue];

    const selectedTrack = trackList.find(track => track.snowflake === selected);
    const selectedIndex = trackList.indexOf(selectedTrack);

    const [title, description] = getTitleAndDescription(selectedTrack);

    /** @type {DiscordJs.InteractionReplyOptions} */
    const messageOptions = {
        content: LANG.MUSICDISPLAYER_PLAYLIST_ASK_WHAT_TO_DO,
        embeds: [
            new DiscordJs.EmbedBuilder()
                .setTitle(`${getDisplayEmoji(selectedIndex)} ${title}`)
                .setDescription(description)
            ,
        ],
        components: [
            new DiscordJs.ActionRowBuilder()
                .addComponents(
                    new DiscordJs.ButtonBuilder()
                        .setCustomId('PotatOSMusicPlayerPlaylistDoNothing')
                        .setLabel(LANG.MUSICDISPLAYER_PLAYLIST_DO_NOTHING)
                        .setStyle(DiscordJs.ButtonStyle.Secondary)
                        .setEmoji('🔙')
                    ,
                    new DiscordJs.ButtonBuilder()
                        .setCustomId('PotatOSMusicPlayerPlaylistPlayNext')
                        .setLabel(LANG.MUSICDISPLAYER_PLAYLIST_PLAY_NEXT)
                        .setStyle(DiscordJs.ButtonStyle.Primary)
                        .setEmoji('🔝')
                    ,
                    new DiscordJs.ButtonBuilder()
                        .setCustomId('PotatOSMusicPlayerPlaylistRemove')
                        .setLabel(LANG.MUSICDISPLAYER_PLAYLIST_REMOVE)
                        .setStyle(DiscordJs.ButtonStyle.Danger)
                        .setEmoji('🗑')
                    ,
                )
            ,
        ],
        ephemeral: true,
    };

    if (selectedIndex > 0) {
        interaction.reply(messageOptions);

        const filter = button => {
            return (
                (button.user.id === interaction.member.id) &&
                (
                    (button.customId === 'PotatOSMusicPlayerPlaylistDoNothing') ||
                    (button.customId === 'PotatOSMusicPlayerPlaylistPlayNext') ||
                    (button.customId === 'PotatOSMusicPlayerPlaylistRemove')
                )
            );
        };
        
        const collector = interaction.channel.createMessageComponentCollector({filter, max : 1});

        collector.on('collect', collectedInteraction => {
            collectedInteraction.deferUpdate();
            
            if (subscription?.isMemberConnected(collectedInteraction.member)){
                if (collectedInteraction.customId === 'PotatOSMusicPlayerPlaylistPlayNext') {
                    subscription.moveTrackToFirstPosition(selectedTrack);
                } else if (collectedInteraction.customId === 'PotatOSMusicPlayerPlaylistRemove') {
                    subscription.removeTrack(selectedTrack);
                }

                displayMusicDisplayer(interaction.channel);
                
                interaction.editReply({ 
                    content: LANG.MUSICDISPLAYER_STOP_REQUEST_RECEIVED,
                    embeds: [], 
                    components : [],
                });
                
            }
            else {
                const messageOptions = MessagePrintReply.getAlertMessageOptions(LANG._MUSICPLAYER_NOT_CONNECTED);
                messageOptions.content = "";
                messageOptions.components = [];

                interaction.editReply(messageOptions);
            }
        });
    }
    else {
        interaction.deferUpdate();
        displayMusicDisplayer(interaction.channel);
    }
}

const customIdPlaylist = 'PotatOSMusicPlayerPlaylist';

const selectMenuPlaylist = (trackList) => {
    return new DiscordJs.SelectMenuBuilder()
        .setCustomId(customIdPlaylist)
        .setPlaceholder(LANG.MUSICDISPLAYER_SHOW_PLAYLIST(trackList.length-1))
        .setMaxValues(1)
        .setMinValues(1)
        .addOptions(buildOptions(trackList))
    ;
};

export const musicPlayerPlaylist = {
    selectMenu: selectMenuPlaylist,
    command: commandPlaylist,
    customId: customIdPlaylist
};

// _____________________________________________________________________________________________________________________
//

function buildOptions(trackList) {

    let options = [];

    trackList.forEach((track, i) => {
        const [title, description] = getTitleAndDescription(track);
        options.push({
            label : (`${title}`).substring(0, 100),
            description : (`${description}`).substring(0, 100),
            value : `${track.snowflake}`,
            emoji : getPlaylistEmoji(i),
        });
    });

    return options;
}

function getTitleAndDescription(track) {

    const title = 
    track.metadata.isYoutube  ?  `${track.metadata.title}`
    :( track.metadata.isFile  ? `${track.metadata.key}`
    :( track.metadata.isRadio ? `🟢 ${track.metadata.name}` 
    :/* else                 */ `${track.metadata.file ?? LANG.MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_TITLE}`
    ));

    const description = 
    track.metadata.isYoutube  ? `${track.metadata.author} • ${track.metadata.isLive?`⬤ LIVE`:UTILS.durationToString(track.metadata.duration)} • ${UTILS.viewsToString(track.metadata.viewCount)} • ${UTILS.YYYYMMDDToString(track.metadata.uploadDate)}`
    :( track.metadata.isFile  ? LANG.MUSICDISPLAYER_THROUGH_COMMAND
    :( track.metadata.isRadio ? `Radio Garden • ${track.metadata.place}, ${track.metadata.country}` 
    :/* else                 */ `${track.metadata.url ?? LANG.MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_DESC}`
    ));

    return [title, description];
}

function getDisplayEmoji(i){
    return [
        ':notes:',      // 🎶
        ':track_next:', // ⏭
        ':two:',        // 2️⃣
        ':three:',      // 3️⃣
        ':four:',       // 4️⃣
        ':five:',       // 5️⃣
        ':six:',        // 6️⃣
        ':seven:',      // 7️⃣
        ':eight:',      // 8️⃣
        ':nine:',       // 9️⃣
        ':keycap_ten:'  // 🔟
    ][i] ?? ':hash:';   // #️⃣
}

function getPlaylistEmoji(i){
    return ['🎶', '⏭', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i] ?? '#️⃣';
}
