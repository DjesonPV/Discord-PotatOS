//PotatOS - Commands
// > ROCK PAPER SCISSORS / SHIFUMI / ROSHAMBO
//  • • • • • • • • • • • • • • • • • • • • • • • •
import { SlashCommandBuilder } from '@discordjs/builders';
import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import * as LANG from "../Language.mjs";

const emojisMove = [":fist:", ":raised_hand:", ":v:"];
const emojisResult = [":arrow_right:",":regional_indicator_i:",":arrow_left:"];

const snReply = [
    LANG._SHIFUMI_DEFEAT_SENTENCES,
    LANG._SHIFUMI_DRAW_SENTENCES,
    LANG._SHIFUMI_VICTORY_SENTENCES
];

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

    MessagePrintReply.replyToAnInteraction(interaction, `:bust_in_silhouette: ${emojisMove[playerMove]}   ${emojisResult[result]}   ${emojisMove[botMove]} ${LANG._SHIFUMI_BOT_EMOJI}  ${snReply[result][botResponse]}`);
}

const slash = new SlashCommandBuilder()
    .setName(LANG._SHIFUMI_CMDNAME)
    .setDescription(LANG._SHIFUMI_DESC)
    .addIntegerOption(option => option
        .setName('play')
        .setDescription(LANG._SHIFUMI_PLAY_DESC)
        .setRequired(true)
        .addChoices(
            { name: LANG._SHIFUMI_PLAY_ROCK, value: 0 },
            { name: LANG._SHIFUMI_PLAY_PAPER, value: 1 },
            { name: LANG._SHIFUMI_PLAY_SCISSORS, value: 2}
        )
        .setMinValue(0)
        .setMaxValue(2)   
    )
;

export const shifumi = {slash: slash, command: command};
