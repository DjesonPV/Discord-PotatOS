import {sendOnChannel} from "../Bot.mjs";

const emojisMove = [":fist:", ":raised_hand:", ":v:"];
const emojisResult = [":arrow_right:",":left_right_arrow:",":arrow_left:"];

const sntVictory  = ["Aucun aléatoire, que du talent.","Moins d'energie et poutant plus efficace.", "Humain == nul, Patate++"];
const sntDefeat   = ["Purée...", "Sûrement une erreur de calcul...", "Triche évidente !"];
const sntEquality = ["Les grands esprits se recontrent.", "Même puissance de calcul, et je suis une patate !", "Je suis quatre univers parllèles devant toi !"]; 
const snReply = [sntDefeat, sntEquality, sntVictory];

/**
 * Works with (2*Humain)+Bot : 0  = bot defeat, 1 = equality, 2 = bot victory
 */
const tableMath = [ 1, 2, 0, 0, 1, 2, 2, 0, 1];

function game(playerMove, msg){
    
    // 0, 1, 2
    let botMove     = Math.floor(Math.random()*3);

    let result = tableMath[(3*playerMove+botMove)];
    let botResponse = Math.floor(Math.random()*3);

    sendOnChannel(msg.channel,`:bust_in_silhouette: ${emojisMove[playerMove]}   ${emojisResult[result]}   ${emojisMove[botMove]} :potato:  <@${msg.author.id}>  ${snReply[result][botResponse]}`);
}

/**
 * Rock-Paper-Scissors game | Rock
 * @param args String from command message
 * @param msg Represents a message on Discord
 */
export function pierre(args, msg){
    game(0,msg);
}

/**
 * Rock-Paper-Scissors game | Paper
 * @param args String from command message
 * @param msg Represents a message on Discord
 */
export function feuille(args, msg){
    game(1,msg);
}

export function papier(args, msg){
    feuille(args, msg);
}

/**
 * Rock-Paper-Scissors game | Scissors
 * @param args String from command message
 * @param msg Represents a message on Discord
 */
export function ciseaux(args, msg){
    game(2,msg);
}
