import * as DiscordJs from 'discord.js';

export default class MessageSafeDelete{

    static botUserId;

    /** @param {DiscordJs.Message} message */
    static deleteMessage(message) {
        if (!message) return false;

        if (this.isMessageMine(message) && message.deletable){
            message.delete().catch(()=>{});
            return true;
        }
        
        return false;
    }
    
    /** @param {DiscordJs.Message} message */
    static isMessageMine(message) {
        if (
            message && 
            message.author &&
            ((message.author.id === this.botUserId) && 
            message.author.bot)
        ) 
        return true;

        return false;
    }

    /** Refuse a CommandInteraction reply  
     * By defer-ing it then deleting the defered message 
     * @param {DiscordJs.ChatInputCommandInteraction} interaction
    */
    static noReply(interaction) {
        interaction.deferReply({fetchReply :true})
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
            new DiscordJs.ButtonBuilder()
                .setCustomId('deleteNotif')
                .setLabel(LANG.MSG_AUTODESTRUCT(duration))
                .setStyle(DiscordJs.ButtonStyle.Secondary)
                .setEmoji('🚮')
            ,
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
                duration * 1000);
        }
    }

}
