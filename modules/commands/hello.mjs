import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";

export function hello(args, msg){
    MessagePrintReply.printTextOnChannel(msg.channel, `Salut`, 10); //##LANG : Hello World!
}
