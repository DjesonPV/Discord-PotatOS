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

// _____________________________________________________________________________
// Enum

const MathChoices = class {
    static Pi = 'pi';
    static Tau = 'tau';
    static One = 'one';
    static Exp = 'exp';
    static Ln  = 'ln';
    static Phi = 'phi';
}

// ___________________________________________________
//
// SlashCommand Maths

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdMaths(interaction) {

    /** @type {string} */
    let result = undefined;

    switch (interaction.options.getString(LANG.maths_InputName)) {
        case MathChoices.Pi:
            result = `π = ${Math.PI}`;
            break;

        case MathChoices.Tau:
            result = `τ = ${2 * Math.PI}`;
            break;

        case MathChoices.One:
            result = `${LANG.maths_InputOne} = 1`;
            break;

        case MathChoices.Exp:
            result = exp(interaction.options.getNumber(LANG.maths_OptionName));
            break;

        case MathChoices.Ln:
            result = ln(interaction.options.getNumber(LANG.maths_OptionName));
            break;

        case MathChoices.Phi:
            result = phi(interaction.options.getNumber(LANG.maths_OptionName));
            break;

        default:
            break;
    }

    if (result !== undefined){
       await MessagePrintReply.replyToAnInteraction(interaction, result);
    } else {
        await MessagePrintReply.replyAlertOnInterarction(interaction, LANG.maths_Error);
    }
}

const slashMaths = new DiscordJs.SlashCommandBuilder()
    .setName(LANG.maths_CommandName)
    .setDescription(LANG.maths_CommandDescription)
    .addStringOption(option => option
        .setName(LANG.maths_InputName)
        .setDescription(LANG.maths_InputDescription)
        .addChoices(
            { name: LANG.maths_InputPi,    value: MathChoices.Pi  },
            { name: LANG.maths_InputTau,   value: MathChoices.Tau },
            { name: LANG.maths_InputExp,   value: MathChoices.Exp },
            { name: LANG.maths_InputLogE, value: MathChoices.Ln  },
            { name: LANG.maths_InputPhi,   value: MathChoices.Phi },
            { name: LANG.maths_InputOne,   value: MathChoices.One }
        )
        .setRequired(true)
    )
    .addNumberOption(option => option
        .setName(LANG.maths_OptionName)
        .setDescription(LANG.maths_OptionDescription)
    )
;

export const maths = { slash: slashMaths, command: cmdMaths };
