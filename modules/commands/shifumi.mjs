import {printTextOnChannel} from "../Bot.mjs";
/*
 *  Commands for Rock Paper Scissors / Shifumi / Roshambo
 *
 */


const emojisMove = [":fist:", ":raised_hand:", ":v:"];
const emojisResult = [":arrow_right:",":regional_indicator_i:",":arrow_left:"];

const sntVictory  = ["Aucun aléatoire, que du talent.","Moins d'energie et poutant plus efficace.", "Humain == nul, Patate++"];
// LANG Taunts victory : Nothing random, skils.  ;  Smart power and smarter logic.  ;  Human == trick, Potato++

const sntDefeat   = ["Purée...", "Sûrement une erreur de calcul...", "Triche évidente !"];
// LANG Taunts defeat : Mashed...  ;  Surely a math error...  ;  Obvious cheat!

const sntDraw = ["Les grands esprits se recontrent.", "Même puissance de calcul, et je suis une patate !", "Je suis quatre univers parallèles devant toi !"];
// LANG Taunts draw : Great minds think alike.  ;  Same brain power and I'm a potato !  ;  I'm four parallel universes ahead of you!

const snReply = [sntDefeat, sntDraw, sntVictory];

/**
 * Works with (2*Humain)+Bot : 0  = bot defeat, 1 = draw, 2 = bot victory
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
export function pierre(args, msg){ //##LANG Function Name : rock
    game(0,msg);
}

/**
 * Rock-Paper-Scissors game | Paper
 */
export function feuille(args, msg){ //##LANG Function Name : paper
    game(1,msg);
}

/**
 * Rock-Paper-Scissors game | Paper
 */
export function papier(args, msg){  //##LANG Function Name : paper DUPLICATE
    feuille(args, msg);
}

/**
 * Rock-Paper-Scissors game | Scissors
 */
export function ciseaux(args, msg){ //##LANG Fucntion Name : scissors
    game(2,msg);
}
