import * as DiscordJs from 'discord.js';
import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';

//
// Private Jokes and overfamillar content
//
//

// PC

/**
 * Private joke on Nathan's computer never delivered
 * @param {DiscordJs.ChatInputCommandInteraction} interaction
 */
function cmdPc(interaction){
    const sentences = [
        `Alors il est bien ton pc Nathan ?`,    // Private Joke : Nathan, how well is your computer?
        `Alors Nathan ce pc ?`,                 // Private Joke : So, Nathan, what's up with the new computer?
        `Il arrive quand ton pc ?`              // Private Joke : Again, when does your computer is delivered?
    ];

    let sentenceKey = Math.floor(Math.random() * sentences.length);

    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printOnChannel(interaction.channel, sentences[sentenceKey]);
}

const slashPc = new DiscordJs.SlashCommandBuilder()
    .setName(`pc`) // pc short for Personal Computer
    .setDescription(`Demande à Nathan quand est-ce qu'il reçoit son ordinateur.`) // Ask Nathan when will his computer will be delivered
;

export const pc = {slash: slashPc, command: cmdPc};

// - - -
// PD

/**
 * Private joke refering some of the 
 * @param {DiscordJs.ChatInputCommandInteraction} interaction
 */
 function cmdPd(interaction){ 
    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printOnChannel(interaction.channel, `Cyril c'est un sacré sacripant`);
}

const slashPd = new DiscordJs.SlashCommandBuilder()
    .setName(`pd`)
    .setDescription(`C'est vrai`)
;

export const pd = {slash: slashPd, command: cmdPd};

// - - -
// PK

/**
 * Private joke of an interaction between Jeremy 
 * and a random woman in a train hall
 * @param {DiscordJs.ChatInputCommandInteraction} interaction
 */
function cmdPk(interaction){ 
    MessageSafeDelete.noReply(interaction);
    // Private Joke : What's the shortest path to your heart?
    MessagePrintReply.printOnChannel(interaction.channel, `Quel est le chemin le plus court pour aller vers ton coeur ?`);
}

const slashPk = new DiscordJs.SlashCommandBuilder()
    .setName(`pk`) // pk short for "pourquoi" ("why" in French) and a word play between previous function pc and nickname starting with K 
    .setDescription(`Demande la direction pour trouver l'être cher`) // Ask for directions to your soulmate
;

export const pk = {slash: slashPk, command: cmdPk};

// - - -
// P*TAIN

/**
 * Just print a gif of a guy rage throwing a cristmas tree
 * "PUTAIN" is refering the french interjection of rage
 * @param {DiscordJs.ChatInputCommandInteraction} interaction
 */
async function cmdPxTAIN(interaction){ 
    await MessagePrintReply.replyToAnInteraction(interaction, "https://c.tenor.com/Xk5yKpCr96sAAAAd/christmas-tree-hit.gif", 10);
}

const slashPxTAIN = new DiscordJs.SlashCommandBuilder()
    .setName(`putain`) // dammit
    .setDescription(`PREND ÇA !`) // TAKE THAT!
;

export const putain = {slash: slashPxTAIN, command: cmdPxTAIN};



