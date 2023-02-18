import * as DiscordJs from 'discord.js';
import * as LANG from '../../Language.mjs';
import VoiceSubscription from '../../botModules/musicPlayer/VoiceSubscription.mjs';

/** @param {DiscordJs.StringSelectMenuInteraction} interaction */
function commandPlaylist(interaction) {
    const subscription = VoiceSubscription.get(interaction.guild.id);
    if (subscription === undefined) {
        interaction.deferUpdate();
        return;
    }

    const selected = interaction.values[0];
    const trackList = subscription.playlist.getCuratedDataPlaylist();

    const selectedTrack = trackList.find(track => track.id === selected);
    const selectedIndex = trackList.indexOf(selectedTrack);

    const PlaylistButtonIDs = class {
        static DoNothing = 'PotatOSMusicPlayerPlaylistDoNothing';
        static PlayNext = 'PotatOSMusicPlayerPlaylistPlayNext';
        static Remove = 'PotatOSMusicPlayerPlaylistRemove';
    };

    if (selectedTrack !== undefined) { 

        /** @type {DiscordJs.InteractionReplyOptions} */
        const messageOptions = {
            content: LANG.musicdisplayerPlaylistSelectionAskAction,
            embeds: [
                new DiscordJs.EmbedBuilder()
                    .setTitle(`${selectedTrack.failed?':x:':getDisplayEmoji(selectedIndex)} ${selectedTrack.data.playlistTitle}`)
                    .setDescription(selectedTrack.data.playlistDescription)
                ,
            ],
            components: [
                new DiscordJs.ActionRowBuilder()
                    .addComponents(
                        new DiscordJs.ButtonBuilder()
                            .setCustomId(PlaylistButtonIDs.DoNothing)
                            .setLabel(LANG.musicdisplayerPlaylistSelectionDoNothing)
                            .setStyle(DiscordJs.ButtonStyle.Secondary)
                            .setEmoji('🔙')
                        ,
                        new DiscordJs.ButtonBuilder()
                            .setCustomId(PlaylistButtonIDs.PlayNext)
                            .setLabel(LANG.musicdisplayerPlaylistSelectionOnTop)
                            .setStyle(DiscordJs.ButtonStyle.Primary)
                            .setEmoji('🔝')
                        ,
                        new DiscordJs.ButtonBuilder()
                            .setCustomId(PlaylistButtonIDs.Remove)
                            .setLabel(LANG.musicdisplayerPlaylistSelectionRemove)
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
                    (Object.values(PlaylistButtonIDs).find(id => id === button.customId) !== undefined)
                );
            };
            
            const collector = interaction.channel.createMessageComponentCollector({filter, max : 1});

            collector.on('collect', collectedInteraction => {
                collectedInteraction.deferUpdate();
                
                if (subscription?.isMemberConnected(collectedInteraction.member)){
                    if (collectedInteraction.customId === PlaylistButtonIDs.PlayNext) {
                        subscription.playlist.moveTop(selectedTrack.id);
                    } else if (collectedInteraction.customId === PlaylistButtonIDs.Remove) {
                        subscription.playlist.remove(selectedTrack.id);
                    }
                    
                    interaction.editReply({ 
                        content: LANG.musicdisplayerStopReceivedAnwser,
                        embeds: [], 
                        components : [],
                    });
                    
                }
                else {
                    const messageOptions = MessagePrintReply.getAlertMessageOptions(LANG.musicplayerFailedToExecuteCommand);
                    messageOptions.content = "";
                    messageOptions.components = [];

                    interaction.editReply(messageOptions);
                }
            });
        }
        else {
            interaction.deferUpdate();
            subscription.updateMusicDisplayerComponents();
        }
    } else {
        interaction.deferUpdate();
    }
}

const customIdPlaylist = 'PotatOSMusicPlayerPlaylist';

/** @param {Array<import('../../botModules/musicPlayer/SubscriptionPlaylist.mjs').CuratedTrackData>} trackList */
const selectMenuPlaylist = (trackList) => {
    return new DiscordJs.StringSelectMenuBuilder()
        .setCustomId(customIdPlaylist)
        .setPlaceholder(LANG.musicdisplayerShowPlaylist(trackList.length-1))
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

/** @param {Array<import('../../botModules/musicPlayer/SubscriptionPlaylist.mjs').CuratedTrackData>} trackList */
function buildOptions(trackList) {

    let options = [];

    trackList.forEach((track, i) => {
        options.push({
            label : track.data.playlistTitle.substring(0, 100),
            description : track.data.playlistDescription.substring(0, 100),
            value : `${track.id}`,
            emoji : track.failed?'❌':getPlaylistEmoji(i),
        });
    });

    return options;
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
