export function deleteNotif(itr){
    itr.message.delete().catch(()=>{});
}