import * as DiscordJs from 'discord.js';
import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';

const menuBruh = new DiscordJs.ContextMenuCommandBuilder()
    .setName(`BRUH`)
    .setType(DiscordJs.ApplicationCommandType.Message)
;

/** @param {DiscordJs.ContextMenuCommandInteraction} interaction */
async function cmdBruh (interaction) {

    const message = await interaction.channel.messages.fetch(interaction.targetId);

    let noReactionsPresent = true;

    await Promise.all(message.reactions.cache.map(async reaction => {
        const reactionUsers = await reaction.users.fetch();
        if (
            (
                (reaction.emoji.name === '🅱️') ||
                (reaction.emoji.name === '🇷') ||
                (reaction.emoji.name === '🇺') ||
                (reaction.emoji.name === '🇭')
            ) && reactionUsers.get(reaction.client.user.id)
        ) {
            reaction.users.remove(reaction.client.user);
            noReactionsPresent &= false;
        }
    }));

    if (noReactionsPresent)
    message.react('🅱️')
        .then(()=>{
            message.react('🇷');
        })
        .then(()=>{
            message.react('🇺');
        })
        .then(()=>{
            message.react('🇭');
        })
    ;

    MessageSafeDelete.noReply(interaction);
}

export const bruh = { menu: menuBruh, command: cmdBruh };
