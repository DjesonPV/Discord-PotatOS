import * as DiscordJs from 'discord.js';
import * as ButtonInteractions from "../botCommands/ButtonInteractions.mjs";

export default class MessageSafeDelete{

    static botUserId;

    /** @param {DiscordJs.Message} message */
    static async deleteMessage(message) {
        if (this.isMessageMine(message) && message.deletable){
            await message.delete().catch(console.log);
        }
    }
    
    /** @param {DiscordJs.Message} message */
    static isMessageMine(message) {
        return (
            (message?.author?.id === this.botUserId) && 
            message?.author?.bot
        )
    }

    /** Refuse a CommandInteraction reply  
     * By defer-ing it then deleting the defered message 
     * @param {DiscordJs.ChatInputCommandInteraction} interaction
    */
    static noReply(interaction) {
        interaction.deferReply({fetchReply: true})
            .then((message) =>
                MessageSafeDelete.deleteMessage(message)
            )
            .catch((error)=>{
                console.log(error)
            })
        ;
    }

    /** @param {number} duration */
    static durationButtonActionRowBuilder(duration) {
        return new DiscordJs.ActionRowBuilder().addComponents(
            ButtonInteractions.deleteMessage.button(duration),
        );
    }

    /**
     * @param {DiscordJs.Message} message 
     * @param {number} duration
     */
    static deleteMessageAfterDuration(message, duration) {
        if (duration > 0){
            setTimeout(
                () => {
                    MessageSafeDelete.deleteMessage(message);
                },
                duration * 1000
            );
        }
    }

    /** @param {DiscordJs.ChatInputCommandInteraction} interaction */
    static async startThinking(interaction) {
        return await interaction.deferReply({fetchReply: true});
    }

    /** @param {DiscordJs.Message} message */
    static stopThinking(message) {
        MessageSafeDelete.deleteMessage(message);
    }

}
