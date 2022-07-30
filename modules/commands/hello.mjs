import MessageSafeDelete from '../botModules/MessageSafeDelete.mjs';
import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import { SlashCommandBuilder } from '@discordjs/builders';
import * as LANG from "../Language.mjs";

export function cmdHello(interaction){
    MessagePrintReply.replyToAnInteraction(interaction, LANG._HELLO_HI, 5);
}

const slashHello = new SlashCommandBuilder()
    .setName('hello')
    .setNameLocalization('fr','salut')
    .setDescription(LANG._HELLO_DESC)
;

export const hello = {slash: slashHello, command: cmdHello};


/**
 * Send a private message answering to a ping by a pong
 */
function cmdPing(interaction){
    MessageSafeDelete.noReply(interaction);
    interaction.user.send("***pong***");
}

const slashPing = new SlashCommandBuilder()
    .setName('ping')
    .setDescription(LANG._PING_DESC)
;

export const ping = {slash: slashPing, command: cmdPing};

