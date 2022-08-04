import * as DiscordJs from 'discord.js';
import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';
import * as LANG from "../../Language.mjs";

/**
 * Private joke on Nathan's computer never delivered
 * @param {DiscordJs.ChatInputCommandInteraction} interaction
 */
function cmdPc(interaction){
    const sentences = LANG._SASS_PC_SENTENCES;

    let sentenceKey = Math.floor(Math.random() * sentences.length);

    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printOnChannel(interaction.channel, sentences[sentenceKey]);
}

const slashPc = new DiscordJs.SlashCommandBuilder()
    .setName(LANG._SASS_PC_CMDNAME)
    .setDescription(LANG._SASS_PC_DESC)
;

export const pc = {slash: slashPc, command: cmdPc};

/**
 * Private joke of an interaction between Jeremy 
 * and a random woman in a train hall
 * @param {DiscordJs.ChatInputCommandInteraction} interaction
 */
function cmdPk(interaction){ 
    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printOnChannel(interaction.channel, LANG._SASS_PK_SENTENCE);
}

const slashPk = new DiscordJs.SlashCommandBuilder()
    .setName(LANG._SASS_PK_CMDNAME)
    .setDescription(LANG._SASS_PK_DESC)
;

export const pk = {slash: slashPk, command: cmdPk};

/**
 * Just print a gif of a guy rage throwing a cristmas tree
 * "PUTAIN" is refering the french interjection of rage
 * @param {DiscordJs.ChatInputCommandInteraction} interaction
 */
function cmdPUTAIN(interaction){ 
    MessagePrintReply.replyToAnInteraction(interaction, "https://c.tenor.com/Xk5yKpCr96sAAAAd/christmas-tree-hit.gif", 3);
}

const slashPUTAIN = new DiscordJs.SlashCommandBuilder()
    .setName(LANG._DAMMIT_CMDNAME)
    .setDescription(LANG._DAMMIT_DESC)
;

export const putain = {slash: slashPUTAIN, command: cmdPUTAIN};



