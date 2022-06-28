import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
/*
 * Commands that write specific private jokes to bother people
 *
 */


/**
 * Private joke on Nathan's computer never delivered
 */
export function pc(args, msg){ //##LANG Function Name : pc short for Personal Computer
    const sntc = [
        `Alors il est bien ton pc Nathan ?`, //##LANG Private Joke : Nathan, how well is your computer?
        `Alors Nathan ce pc ?`,              //##LANG Private Joke : So, Nathan, what's up with the new computer?
        `Il arrive quand ton pc ?`           //##LANG Private Joke : Again, when does your computer is delivered?
    ];

    let rng = Math.floor(Math.random() * sntc.length);

    MessagePrintReply.printTextOnChannel(msg.channel, sntc[rng]);
}

/**
 * Private joke of an interaction between Jeremy 
 * and a random woman in a train hall
 */
export function pk(args, msg){ //##LANG Function Name : pk short for WHY in French and a word play between previous function pc and nickname starting with K 
    MessagePrintReply.printTextOnChannel(msg.channel, `Quel est le chemin le plus court pour aller vers ton coeur ?`); //##LANG Private Joke : What's the shortest path to your heart?
}

/**
 * Just print a gif of a guy rage throwing a cristmas tree
 * "PUTAIN" is refering the french interjection of rage
 */
export function PUTAIN(args, msg){ //##LANG Function Name : DAMNIT
    MessagePrintReply.printLinkOnChannel(msg.channel, "https://c.tenor.com/Xk5yKpCr96sAAAAd/christmas-tree-hit.gif", 10)
}



