// > ROCK PAPER SCISSORS / SHIFUMI / ROSHAMBO
//  • • • • • • • • • • • • • • • • • • • • • • • •
import * as DiscordJs from 'discord.js';
import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import * as LANG from "../../Language.mjs";

const emojisMove = [":fist:", ":raised_hand:", ":v:"];
const emojisResult = [":arrow_right:",":regional_indicator_i:",":arrow_left:"];

const snReply = [
    LANG.shifumi_SentencesDefeat,
    LANG.shifumi_SentencesDraw,
    LANG.shifumi_SentencesVictory
];

/**
 * Works with (2*Humain)+Bot : 0  = bot defeat, 1 = draw, 2 = bot victory
 */
const tableMath = [ 1, 2, 0, 0, 1, 2, 2, 0, 1];

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function command(interaction){

    const playerMove = interaction.options.getInteger('play');
    
    // 0, 1, 2
    let botMove     = Math.floor(Math.random()*3);  // Bot Move
    let botResponse = Math.floor(Math.random()*3);  // Repartee

    let result = tableMath[(3*playerMove+botMove)]; // Evaluate win

    await MessagePrintReply.replyToAnInteraction(interaction, `:bust_in_silhouette: ${emojisMove[playerMove]}   ${emojisResult[result]}   ${emojisMove[botMove]} ${LANG.shifumi_Emoji}  ${snReply[result][botResponse]}`);
}

const slash = new DiscordJs.SlashCommandBuilder()
    .setName(LANG.shifumi_CommandName)
    .setDescription(LANG.shifumi_CommandDescription)
    .addIntegerOption(option => option
        .setName('play')
        .setDescription(LANG.shifumi_InputDescription)
        .setRequired(true)
        .addChoices(
            { name: LANG.shifumi_InputRock, value: 0 },
            { name: LANG.shifumi_InputPaper, value: 1 },
            { name: LANG.shifumi_InputScissors, value: 2}
        )
        .setMinValue(0)
        .setMaxValue(2)   
    )
;

export const shifumi = {slash: slash, command: command};
