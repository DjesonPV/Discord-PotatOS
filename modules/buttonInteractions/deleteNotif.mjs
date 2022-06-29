export function deleteNotif(itr){
    if(itr.message.author.bot)
        itr.message.delete().catch(()=>{});
}