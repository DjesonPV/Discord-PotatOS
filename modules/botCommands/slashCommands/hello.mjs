import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';
import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import * as DiscordJs from 'discord.js';
import * as LANG from "../../Language.mjs";

//
// Reply hello

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
export async function cmdHello(interaction){
    await MessagePrintReply.replyToAnInteraction(interaction, LANG.hello_Hi, 5);
}

const slashHello = new DiscordJs.SlashCommandBuilder()
    .setName('hello')
    .setNameLocalization('fr','salut')
    .setDescription(LANG.hello_CommandDescription)
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
    .setDescription(LANG.ping_CommandDescription)
;

export const ping = {slash: slashPing, command: cmdPing};
