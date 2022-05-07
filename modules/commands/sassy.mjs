import {printTextOnChannel, printLinkOnChannel} from "../Bot.mjs";

/*
 * Commands that write specific private jokes to bother people
 *
 */


/**
 * Private joke on Nathan's computer never delivered
 */
export function pc(args, msg){
    const sntc = [
        `Alors il est bien ton pc Nathan ?`,
        `Alors Nathan ce pc ?`,
        `Il arrive quand ton pc ?`
    ];

    let rng = Math.floor(Math.random() * sntc.length);

    printTextOnChannel(msg.channel, sntc[rng]);
}

/**
 * Private joke of an interaction between Jeremy 
 * and a random woman in a train hall
 */
export function pk(args, msg){
    printTextOnChannel(msg.channel, `Quel est le chemin le plus court pour aller vers ton coeur ?`);
}

/**
 * Just print a gif of a guy rage throwing a cristmas tree
 * "PUTAIN" is refering the french interjection of rage
 */
export function PUTAIN(args, msg){
    printLinkOnChannel(msg.channel, "https://c.tenor.com/Xk5yKpCr96sAAAAd/christmas-tree-hit.gif", 10)
}



