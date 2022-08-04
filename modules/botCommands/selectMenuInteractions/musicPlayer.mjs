import * as DiscordJs from 'discord.js';
import * as LANG from '../../Language.mjs';


/** @param {DiscordJs.SelectMenuInteraction} interaction */
function commandPlaylist(interaction){
    interaction.deferUpdate();
}

const customIdPlaylist = 'PotatOSMusicPlayerPlaylist';

const selectMenuPlaylist = (options, trackListLength) => {
    return new DiscordJs.SelectMenuBuilder()
        .setCustomId(customIdPlaylist)
        .setPlaceholder(LANG.MUSICDISPLAYER_SHOW_PLAYLIST(trackListLength))
        .setMaxValues(1)
        .setMinValues(1)
        .addOptions(options)
    ;
};

export const musicPlayerPlaylist = {
    selectMenu: selectMenuPlaylist,
    command: commandPlaylist,
    customId: customIdPlaylist
};


