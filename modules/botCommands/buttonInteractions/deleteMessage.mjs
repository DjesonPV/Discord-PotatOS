import * as DiscordJs from 'discord.js';
import MessageSafeDelete from "../../botModules/MessageSafeDelete.mjs";
import * as LANG from "../../Language.mjs";

function cmdDelete(interaction){
    MessageSafeDelete.deleteMessage(interaction.message);
}

const customIdDelete = 'PotatOSDeleteMessage';

const buttonDelete = (duration) => { 
    return new DiscordJs.ButtonBuilder()
        .setCustomId(customIdDelete)
        .setLabel(LANG.messageAutodelete(duration))
        .setStyle(DiscordJs.ButtonStyle.Secondary)
        .setEmoji('🚮')
    ;
};

export const deleteMessage = { button: buttonDelete, command: cmdDelete, customId: customIdDelete};
