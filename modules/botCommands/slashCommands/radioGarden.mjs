import * as DiscordJs                   from 'discord.js';
import * as LANG from "../../Language.mjs";
import * as RadioGarden from "../../botModules/RadioGarden.mjs";
import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdRadio (interaction) {

    MessageSafeDelete.noReply(interaction);

    try {
        const results = await RadioGarden.searchForRadioUrl('zig zag hits');
        console.log(results);
    } catch (error) {
        console.log(error);
    }
}

const slashRadio = new DiscordJs.SlashCommandBuilder()
    .setName('radio')
    .setDescription('fonction de test pour la radio')
;

export const radio = {slash: slashRadio, command: cmdRadio};
