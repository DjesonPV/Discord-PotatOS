//PotatOS - Commands
// > ROCK PAPER SCISSORS / SHIFUMI / ROSHAMBO
//  • • • • • • • • • • • • • • • • • • • • • • • •
import { SlashCommandBuilder } from '@discordjs/builders';
import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";

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

function command(interaction){

    const playerMove = interaction.options.getInteger('play');
    
    // 0, 1, 2
    let botMove     = Math.floor(Math.random()*3);  // Bot Move
    let botResponse = Math.floor(Math.random()*3);  // Repartee

    let result = tableMath[(3*playerMove+botMove)]; // Evaluate win

    MessagePrintReply.replyToAnInteraction(interaction, `:bust_in_silhouette: ${emojisMove[playerMove]}   ${emojisResult[result]}   ${emojisMove[botMove]} :potato:  ${snReply[result][botResponse]}`);
}

const slash = new SlashCommandBuilder()
    .setName('shifumi')
    .setDescription('Joue à Pierre-Feuille-Ciseaux contre PotatOS') //##LANG Command description : Play Rock-Paper-Scissors against PotatOS
    .addIntegerOption(option => option
        .setName('play')
        .setDescription('Pierre, Feuille, ou Ciseaux') //##LANG : Rock, Paper, or Scissors
        .setRequired(true)
        .addChoices(
            { name: '✊ Pierre', value: 0 }, //##LANG : Rock
            { name: '✋ Feuille', value: 1 }, //##LANG : Paper
            { name: '✌ Ciseaux', value: 2}  //##LANG : Scissors
        )
        .setMinValue(0)
        .setMaxValue(2)   
    )
;

export const shifumi = {slash: slash, command: command};
