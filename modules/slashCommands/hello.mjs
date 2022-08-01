import MessageSafeDelete from '../botModules/MessageSafeDelete.mjs';
import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import * as DiscordJs from 'discord.js';
import * as LANG from "../Language.mjs";

//
// Reply hello

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
export function cmdHello(interaction){
    MessagePrintReply.replyToAnInteraction(interaction, LANG._HELLO_HI, 5);
}

const slashHello = new DiscordJs.SlashCommandBuilder()
    .setName('hello')
    .setNameLocalization('fr','salut')
    .setDescription(LANG._HELLO_DESC)
;

export const hello = {slash: slashHello, command: cmdHello};

// ________________________________________________________
//
// Send a private message answering to a ping by a pong

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
function cmdPing(interaction){
    MessageSafeDelete.noReply(interaction);
    interaction.user.send("***pong***");
}

const slashPing = new DiscordJs.SlashCommandBuilder()
    .setName('ping')
    .setDescription(LANG._PING_DESC)
;

export const ping = {slash: slashPing, command: cmdPing};
