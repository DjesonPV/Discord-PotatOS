export default class MessageSafeDelete{

    static botUserId;


    static deleteMessage(message) {
        if (!message) return false;

        if (this.isMessageMine(message) && message.deletable){
            message.delete().catch(()=>{});
            return true;
        }
        
        return false;
    }

    static deleteThisMessageEvenSoItSNotMine(message) {
        if (!message) return false;

        console.log(`${Date.now()} : I DELETED SOMEONE ELSE MESSAGE`);

        return message.delete()
    }

    
    static isMessageMine(message){
        if (message && message.author &&((message.author.id === this.botUserId) && message.author.bot)) return true;

        return false;
    }

    /** Refuse a CommandInteraction reply  
     * By defer-ing it then deleting the defered message 
    */
    static noReply(interaction){
       interaction.deferReply({fetchReply :true}).then((msg) =>MessageSafeDelete.deleteMessage(msg)).catch((err)=>{console.log(err)});
    }


}
