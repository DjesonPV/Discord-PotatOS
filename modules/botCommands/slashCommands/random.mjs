import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import * as DiscordJs from 'discord.js';
import * as LANG from "../../Language.mjs";
import fetch from "node-fetch";

/**
 * 
 * @param {DiscordJs.ChatInputCommandInteraction} interaction 
 */
async function cmdRandom(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        // cat
        case LANG.random_CatSubcommandName:
            const response = await fetch("http://aws.random.cat/meow");
            const data = await response.json();

            MessagePrintReply.replyToAnInteraction(interaction, data.file);
        break;
        // number
        case LANG.random_NumberSubcommandName:
            const min = interaction.options.getNumber('min');
            const max = interaction.options.getNumber('max');

            //           whole number    random       range    min
            let result = Math.floor(Math.random() * (max-min)) + min;

            MessagePrintReply.replyToAnInteraction(interaction, LANG.random_NumberResponse(result));
        break;
        // list
        case LANG.random_ListSubcommandName:
            const list = interaction.options.getString(LANG.random_ListOptionName).split(' ');

            MessagePrintReply.replyToAnInteraction(interaction, LANG.random_ListResponse(list[Math.floor(Math.random()*list.length)]))
        break;
        // hash
        case LANG.random_HashSubcommandName:
            let string = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            const stringLength = interaction.options.getNumber(LANG.random_HashOptionName);

            for (let i = 0; i < stringLength; ++i)
                string += possible.charAt(Math.floor(Math.random() * possible.length));
            
            MessagePrintReply.replyToAnInteraction(interaction, LANG.random_HashResponse(string));
        break;
        // coin
        case LANG.random_CoinSubcommandName:
        default:
            MessagePrintReply.replyToAnInteraction(interaction, LANG.random_CoinResponse(Math.random() < 0.5?LANG.random_CoinHeads:LANG.random_CoinTails));
        break;
    }
}

const slashRandom = new DiscordJs.SlashCommandBuilder()
    .setName(LANG.random_CommandName)
    .setDescription(LANG.random_CommandDescription)
    // coin
    .addSubcommand(subcommand => subcommand
        .setName(LANG.random_CoinSubcommandName)
        .setDescription(LANG.random_CoinSubcommandDescription)    
    )
    // cat
    .addSubcommand(subcommand => subcommand
        .setName(LANG.random_CatSubcommandName)
        .setDescription(LANG.random_CatSubcommandDescription)
    )
    // number
    .addSubcommand(subcommand => subcommand
        .setName(LANG.random_NumberSubcommandName)
        .setDescription(LANG.random_NumberSubcommandDescription)
        .addNumberOption(option => option
            .setName('min')
            .setDescription(`Minimum`)
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName('max')
            .setDescription(`Maximum`)
            .setRequired(true)    
        )
    )
    // list
    .addSubcommand(subcommand => subcommand
        .setName(LANG.random_ListSubcommandName)
        .setDescription(LANG.random_ListSubcommandDescription)
        .addStringOption(option => option
            .setName(LANG.random_ListOptionName)
            .setDescription(LANG.random_ListOptionDescription)
            .setRequired(true)
        )
    )
    // hash
    .addSubcommand(subcommand => subcommand
        .setName(LANG.random_HashSubcommandName)
        .setDescription(LANG.random_HashSubcommandDescription)
        .addNumberOption(option => option
            .setName(LANG.random_HashOptionName)
            .setDescription(LANG.random_HashOptionDescription)
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
;

export const random = { slash: slashRandom, command: cmdRandom };