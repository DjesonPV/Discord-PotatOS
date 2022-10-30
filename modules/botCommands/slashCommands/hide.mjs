import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';
import * as DiscordJs from 'discord.js';
import * as LANG from "../../Language.mjs";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);


/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
export async function cmdHide(interaction) {
    const secret = require("../../../secret.json");

    // check if GuildMember is connected to any VoiceChannel
    if (interaction.member.voice?.channel?.id)
    interaction.member.voice.setChannel(secret.hiddenVoiceChannelsID[interaction.guild.id])
    .catch(console.error);

    MessageSafeDelete.noReply(interaction);

}

const slashHide = new DiscordJs.SlashCommandBuilder()
    .setName('hide')
    .setDescription(LANG.hide_CommandDescription)
;

export const hide = {slash: slashHide, command: cmdHide};
