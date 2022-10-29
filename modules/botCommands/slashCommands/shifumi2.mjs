// > K9 BITES COW, DEPUTY TAZES K-9, COW KICKS DEPUTY
//  • • • • • • • • • • • • • • • • • • • • • • • •
import * as DiscordJs from 'discord.js';
import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import * as LANG from "../../Language.mjs";

const emojisMove = [":rightwards_hand:", ":metal:", ":point_right:"];
const emojisMove2 = [":leftwards_hand:", ":metal:", ":point_left:"];
const emojisResult = [":arrow_right:",":regional_indicator_i:",":arrow_left:"];

/**
 * Works with (3*Humain)+Bot : 0 = bot defeat, 1 = draw, 2 = bot victory
 */
const tableMath = [ 1, 0, 2, 2, 1, 0, 0, 2, 1];

/**
 * Works with (3*Humain)+Bot : 0 = dog bites cow, 1 = cow kicks deputy, 2 = deputy tazes dog, 3 = draw
 */
const tableSentences = [ 3, 0, 2, 0, 3, 1, 2, 1, 3];

// dog, cow, deputy
// h b   s  w
// 0 0 - 3  1
// 0 1 - 0  0
// 0 2 - 2  2
// 1 0 - 0  2
// 1 1 - 3  1
// 1 2 - 1  0
// 2 0 - 2  0
// 2 1 - 1  2
// 2 2 - 3  1

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function command(interaction){

    const playerMove = interaction.options.getInteger('play');
    
    // 0, 1, 2
    let botMove = Math.floor(Math.random()*3);  // Bot Move

    const resultIndex = (3*playerMove+botMove);

    await MessagePrintReply.replyToAnInteraction(interaction, `:bust_in_silhouette: ${emojisMove[playerMove]}   ${emojisResult[tableMath[resultIndex]]}   ${emojisMove2[botMove]} ${LANG.shifumi_Emoji}  ${LANG.shifumi2_SentencesExplain[tableSentences[resultIndex]]}`);
}

const slash = new DiscordJs.SlashCommandBuilder()
    .setName(LANG.shifumi2_CommandName)
    .setDescription(LANG.shifumi2_CommandDescription)
    .addIntegerOption(option => option
        .setName('play')
        .setDescription(LANG.shifumi2_InputDescription)
        .setRequired(true)
        .addChoices(
            { name: LANG.shifumi2_InputDog, value: 0 },
            { name: LANG.shifumi2_InputCow, value: 1 },
            { name: LANG.shifumi2_InputDeputy, value: 2}
        )
        .setMinValue(0)
        .setMaxValue(2)   
    )
;

export const shifumi2 = {slash: slash, command: command};
