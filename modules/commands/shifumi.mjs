import {printTextOnChannel} from "../Bot.mjs";

/*
 *  Commands for Rock Paper Scissors
 *
 */


const emojisMove = [":fist:", ":raised_hand:", ":v:"];
const emojisResult = [":arrow_right:",":regional_indicator_i:",":arrow_left:"];

const sntVictory  = ["Aucun aléatoire, que du talent.","Moins d'energie et poutant plus efficace.", "Humain == nul, Patate++"];
const sntDefeat   = ["Purée...", "Sûrement une erreur de calcul...", "Triche évidente !"];
const sntEquality = ["Les grands esprits se recontrent.", "Même puissance de calcul, et je suis une patate !", "Je suis quatre univers parallèles devant toi !"]; 
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

    printTextOnChannel(msg.channel,`:bust_in_silhouette: ${emojisMove[playerMove]}   ${emojisResult[result]}   ${emojisMove[botMove]} :potato:  <@${msg.author.id}>  ${snReply[result][botResponse]}`);
}

/**
 * Rock-Paper-Scissors game | Rock
 */
export function pierre(args, msg){
    game(0,msg);
}

/**
 * Rock-Paper-Scissors game | Paper
 */
export function feuille(args, msg){
    game(1,msg);
}

/**
 * Rock-Paper-Scissors game | Paper
 */
export function papier(args, msg){
    feuille(args, msg);
}

/**
 * Rock-Paper-Scissors game | Scissors
 */
export function ciseaux(args, msg){
    game(2,msg);
}
