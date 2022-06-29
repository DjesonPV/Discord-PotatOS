

export default class MessageSafeDelete{

    static botUser;


    static deleteMessage(message) {

        if (message.author === botUser){
            message.delete().catch(()=>{});
        }
        else {
            console.warn(`I tried to delete someone else message, but I cought myself trying`);
        }
        
    }



}