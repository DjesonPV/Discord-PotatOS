import * as MessagePrintReply from "../botModules/MessagePrintReply.mjs";
import { SlashCommandBuilder } from '@discordjs/builders';

function phi(num) {
    let n = num || 1;

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

    switch (interaction.options.getSubcommand()) {
        case 'pi':
            result = `π = ${Math.PI}`;
            break;

        case 'tau':
            result = `τ = ${2 * Math.PI}`;
            break;

        case 'un':
            result = `un = 1`;

        case 'exp':
            result = exp(interaction.options.getNumber('number'));
            break;

        case 'ln':
            result = ln(interaction.options.getNumber('number'));
            break;

        case 'phi':
            result = phi(interaction.options.getInteger('integer'));
            break;

        default:
            break;
    }

    if (result){
        MessagePrintReply.replyToAnInteraction(interaction, result);
    } else {
        MessagePrintReply.replyAlertOnInterarction(interaction, `Bug avec la command \`maths\`, contact un admin !`);
    }


}

const slashMaths = new SlashCommandBuilder()
    .setName('maths')
    .setDescription(`Retourne des resultats mathématique`)

    .addSubcommand(sub => sub
        .setName('pi')
        .setDescription(`π : première constante transcendantale`)
    )
    .addSubcommand(sub => sub
        .setName('tau')
        .setDescription(`τ : constante du périmètre d'un cercle`)
    )
    .addSubcommand(sub => sub
        .setName('un')
        .setDescription(`1 : constante mathématique innée de l'humanité`)
    )
    .addSubcommand(sub => sub
        .setName('exp')
        .setDescription(`e^x : seule fonction étant sa propre dérivée et sa propre primitive`)
        .addNumberOption(option => option
            .setName('number')
            .setDescription('Nombre réel (écrit sous sa forme décimale avec un point)')
        )
    )
    .addSubcommand(sub => sub
        .setName('ln')
        .setDescription(`log_e() : bijection réciproque de la fonction exponentielle`)
        .addNumberOption(option => option
            .setName('number')
            .setDescription('Nombre réel (écrit sous sa forme décimale avec un point)')
        )
    )
    .addSubcommand(sub => sub
        .setName('phi')
        .setDescription(`φ(n) : ratios métalliques`)
        .addIntegerOption(option => option
            .setName('integer')
            .setDescription('Nombre entier naturel non nul')
        )
    )
;

export const maths = { slash: slashMaths, command: cmdMaths };
