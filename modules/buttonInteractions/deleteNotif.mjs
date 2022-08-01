import MessageSafeDelete from "../botModules/MessageSafeDelete.mjs";

export function deleteNotif(interaction){
        MessageSafeDelete.deleteMessage(interaction.message);
}
