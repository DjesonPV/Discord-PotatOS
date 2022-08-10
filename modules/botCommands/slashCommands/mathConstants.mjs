import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import * as DiscordJs from 'discord.js';
import * as LANG from "../../Language.mjs";

//
// Maths Functions

/** @param {number} number */
function phi(number) {
    let integer = Math.floor(Math.abs(number)) || 1;

    let metallicMean = (integer + Math.sqrt(Math.pow(integer, 2) + 4)) / 2;

    return `φ(${integer}) = ${metallicMean}`;
}

/** @param {number} number */
function exp(number) {
    let float = number ?? 1;

    return `e^(${float}) = ${Math.exp(float)}`;
}

/** @param {number} number*/
function ln(number) {
    let float = number ?? 1;

    return `log_e(${float}) = ${Math.log(float)}`;
}

// ___________________________________________________
//
// SlashCommand Maths

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdMaths(interaction) {

    /** @type {string} */
    let result;

    switch (interaction.options.getString(LANG._MATHS_CONSTANT_NAME)) {
        case `pi`:
            result = `π = ${Math.PI}`;
            break;

        case `tau`:
            result = `τ = ${2 * Math.PI}`;
            break;

        case `one`:
            result = `${LANG._MATHS_CONSTANT__ONE} = 1`;
            break;

        case `exp`:
            result = exp(interaction.options.getNumber(LANG._MATHS_NUMBER_NAME));
            break;

        case `ln`:
            result = ln(interaction.options.getNumber(LANG._MATHS_NUMBER_NAME));
            break;

        case `phi`:
            result = phi(interaction.options.getNumber(LANG._MATHS_NUMBER_NAME));
            break;

        default:
            break;
    }

    if (result.length > 0){
       await MessagePrintReply.replyToAnInteraction(interaction, result);
    } else {
        await MessagePrintReply.replyAlertOnInterarction(interaction, LANG._MATHS_ERROR);
    }
}

const slashMaths = new DiscordJs.SlashCommandBuilder()
    .setName(LANG._MATHS_CMDNAME)
    .setDescription(LANG._MATHS_DESC)
    .addStringOption(option => option
        .setName(LANG._MATHS_CONSTANT_NAME)
        .setDescription(LANG._MATHS_CONSTANT_DESC)
        .addChoices(
            { name: LANG._MATHS_CONSTANT__PI,    value: `pi`  },
            { name: LANG._MATHS_CONSTANT__TAU,   value: `tau` },
            { name: LANG._MATHS_CONSTANT__EXP,   value: `exp` },
            { name: LANG._MATHS_CONSTANT__LOG_E, value: `ln`  },
            { name: LANG._MATHS_CONSTANT__PHI,   value: `phi` },
            { name: LANG._MATHS_CONSTANT__ONE,   value: `one` }
        )
        .setRequired(true)
    )
    .addNumberOption(option => option
        .setName(LANG._MATHS_NUMBER_NAME)
        .setDescription(LANG._MATHS_NUMBER_DESC)
    )
;

export const maths = { slash: slashMaths, command: cmdMaths };
