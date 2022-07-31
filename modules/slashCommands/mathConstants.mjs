import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import { SlashCommandBuilder } from '@discordjs/builders';
import * as LANG from "../Language.mjs";

function phi(num) {
    let n = Math.floor(Math.abs(num)) || 1;

    let metallicMean = (n + Math.sqrt(Math.pow(n, 2) + 4)) / 2;

    return `φ(${n}) = ${metallicMean}`;
}

function exp(num) {
    let n = num ?? 1;

    return `e^(${n}) = ${Math.exp(n)}`;
}

function ln(num) {
    let n = num ?? 1;

    return `log_e(${n}) = ${Math.log(n)}`;
}

function cmdMaths(interaction) {

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

    if (result){
        MessagePrintReply.replyToAnInteraction(interaction, result);
    } else {
        MessagePrintReply.replyAlertOnInterarction(interaction, LANG._MATHS_ERROR);
    }
}

const slashMaths = new SlashCommandBuilder()
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
