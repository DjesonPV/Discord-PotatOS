//PotatOS - Commands
// > SPECIFIC PRIVATE JOKES
//  • • • • • • • • • • • • • • • • • • • • • • • •
import {SlashCommandBuilder} from '@discordjs/builders';
import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import MessageSafeDelete from '../botModules/MessageSafeDelete.mjs';


/**
 * Private joke on Nathan's computer never delivered
 */
function cmdPc(interaction){
    const sntc = [
        `Alors il est bien ton pc Nathan ?`, //##LANG Private Joke : Nathan, how well is your computer?
        `Alors Nathan ce pc ?`,              //##LANG Private Joke : So, Nathan, what's up with the new computer?
        `Il arrive quand ton pc ?`           //##LANG Private Joke : Again, when does your computer is delivered?
    ];

    let rng = Math.floor(Math.random() * sntc.length);

    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printTextOnChannel(interaction.channel, sntc[rng]);
}

const slashPc = new SlashCommandBuilder()
    .setName('pc') //##LANG Function Name : pc short for Personal Computer
    .setDescription(`Demande à Nathan quand est-ce qu'il reçoit son ordinateur.`) //##LANG Command description : Ask Nathan when will his computer will be delivered
;

export const pc = {slash: slashPc, command: cmdPc};

/**
 * Private joke of an interaction between Jeremy 
 * and a random woman in a train hall
 */
function cmdPk(interaction){ 
    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printTextOnChannel(interaction.channel, `Quel est le chemin le plus court pour aller vers ton coeur ?`); //##LANG Private Joke : What's the shortest path to your heart?
}

const slashPk = new SlashCommandBuilder()
    .setName('pk') //##LANG Function Name : pk short for WHY in French and a word play between previous function pc and nickname starting with K 
    .setDescription(`Demande la direction pour trouver l'être cher`) //##LANG Command description : Ask for direction to your soulmate
;

export const pk = {slash: slashPk, command: cmdPk};

/**
 * Just print a gif of a guy rage throwing a cristmas tree
 * "PUTAIN" is refering the french interjection of rage
 */
async function cmdPUTAIN(interaction){ 
    MessageSafeDelete.noReply(interaction); 
    MessagePrintReply.printLinkOnChannel(interaction.channel, "https://c.tenor.com/Xk5yKpCr96sAAAAd/christmas-tree-hit.gif", 10);
}

const slashPUTAIN = new SlashCommandBuilder()
    .setName('putain') //##LANG Function Name : DAMNIT 
    .setDescription(`PREND ÇA !`) //##LANG Command description : TAKE THIS
;

export const putain = {slash: slashPUTAIN, command: cmdPUTAIN};



