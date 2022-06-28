import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";

/*
 * Commands that print math constants
 *
 */


/**
 * PI : THE FIRST FOUND TRANSENDANTAL CONSTANT
 */
export function pi(args, msg){
    MessagePrintReply.printTextOnChannel(msg.channel, `π = ${Math.PI}`);
}

export function π(args, msg){
    pi(args, msg);
}

/**
 * TAU : THE CIRCLE DIAMETER CONSTANT
 */
export function tau(args,msg){
    MessagePrintReply.printTextOnChannel(msg.channel, `τ = ${2*Math.PI}`);
}

export function τ(args,msg){
    tau(args, msg);
}

/**
 * PHI : THE METTALIC RATIOS
 */
export function phi(args, msg){
    let n = 1;
    let nbr;
    if (args[0]) {
        nbr = args[0].match(/^\d+|\d+\b|\d+(?=\w)/g) || [];
        nbr = parseInt(nbr[0]);
        if (nbr >= 0) n = nbr;
    }
    
    let metallicMean = (n + Math.sqrt(Math.pow(n,2) + 4))/2;

    MessagePrintReply.printTextOnChannel(msg.channel, `φ(${n}) = ${metallicMean}`);
}

export function φ(args, msg){
    phi(args, msg);
}

export function exp(args, msg){
    let n = 1;
    let nbr;

    if (args[0]) {
        nbr = args[0].match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [];
        nbr = parseFloat(nbr[0]);
        if (nbr >= 0) n = nbr;
        if ((args[0]) && (args[0].charAt(0) == '-')) n = -n;
    }

    MessagePrintReply.printTextOnChannel(msg.channel, `e^(${n}) = ${Math.exp(n)}`);
}

export function e(args,msg){
    exp(args,msg);
}

