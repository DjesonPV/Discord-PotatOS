import {sendOnChannel} from "../Bot.mjs";

export function hello(args, msg){
    sendOnChannel(msg.channel, `Salut`, 10);
}
