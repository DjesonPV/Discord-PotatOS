import { SlashCommandBuilder } from '@discordjs/builders';
import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import MessageSafeDelete from '../botModules/MessageSafeDelete.mjs';
import * as LANG from "../Language.mjs";

/**
 * Private joke on Nathan's computer never delivered
 */
function cmdPc(interaction){
    const sntc = LANG._SASS_PC_SENTENCES;

    let rng = Math.floor(Math.random() * sntc.length);

    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printTextOnChannel(interaction.channel, sntc[rng]);
}

const slashPc = new SlashCommandBuilder()
    .setName(LANG._SASS_PC_CMDNAME)
    .setDescription(LANG._SASS_PC_DESC)
;

export const pc = {slash: slashPc, command: cmdPc};

/**
 * Private joke of an interaction between Jeremy 
 * and a random woman in a train hall
 */
function cmdPk(interaction){ 
    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printTextOnChannel(interaction.channel, LANG._SASS_PK_SENTENCE);
}

const slashPk = new SlashCommandBuilder()
    .setName(LANG._SASS_PK_CMDNAME)
    .setDescription(LANG._SASS_PK_DESC)
;

export const pk = {slash: slashPk, command: cmdPk};

/**
 * Just print a gif of a guy rage throwing a cristmas tree
 * "PUTAIN" is refering the french interjection of rage
 */
function cmdPUTAIN(interaction){ 
    MessagePrintReply.replyToAnInteraction(interaction, "https://c.tenor.com/Xk5yKpCr96sAAAAd/christmas-tree-hit.gif", 3);
}

const slashPUTAIN = new SlashCommandBuilder()
    .setName(LANG._DAMMIT_CMDNAME)
    .setDescription(LANG._DAMMIT_DESC)
;

export const putain = {slash: slashPUTAIN, command: cmdPUTAIN};



