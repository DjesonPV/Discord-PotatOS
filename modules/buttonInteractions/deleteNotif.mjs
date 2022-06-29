import MessageSafeDelete from "../botModules/MessageSafeDelete.mjs";

export function deleteNotif(itr){
        MessageSafeDelete.deleteMessage(itr.message);
}