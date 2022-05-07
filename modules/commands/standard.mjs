import {printTextOnChannel} from "../Bot.mjs";


export function help(args, msg){

}

/**
 * Send a private message answering to a ping by a pong
 * @param args String from command message
 * @param msg Represents a message on Discord
 */
export function ping(args, msg){
    msg.author.send("***pong***");
}

/**
 * Send a private message answering bye hey
 * @param args String from command message
 * @param msg Represents a message on Discord
 */
 export function shy(args, msg){
    msg.author.send("Coucou toi.");
}



