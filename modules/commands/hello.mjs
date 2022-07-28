import MessageSafeDelete from '../botModules/MessageSafeDelete.mjs';
import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import { SlashCommandBuilder } from '@discordjs/builders';

export function cmdHello(interaction){
    MessagePrintReply.replyToAnInteraction(interaction, `Salut`, 5);
}

const slashHello = new SlashCommandBuilder()
    .setName('hello')
    .setNameLocalization('fr','salut')
    .setDescription(`Dire bonjour à PotatOS`) //##LANG Command description : Say hello to PotatOS
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
    .setDescription(`Pong (envoie un message en privé)`) //##LANG Command description : Pong (send a private message)
;

export const ping = {slash: slashPing, command: cmdPing};

