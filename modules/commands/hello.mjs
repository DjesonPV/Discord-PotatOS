import {printTextOnChannel} from "../Bot.mjs";

export function hello(args, msg){
    printTextOnChannel(msg.channel, `Salut`, 10); //##LANG : Hello World!
}
