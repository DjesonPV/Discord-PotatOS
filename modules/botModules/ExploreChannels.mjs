import * as DiscordJs from "discord.js";

export default class channels{

    static text  = new Map();
    static voice = new Map();

    /**
     * Save the channels discovered in Maps
     * @param {DiscordJs.Client} client 
     */
    static explore(client){
        client.channels.cache.forEach( channel => {
            if (
                (channel.type === DiscordJs.ChannelType.GuildText)
                // Can only writes in normal TextChannels
            ){
                this.text.set(channel.id, channel);
            } else
            if (channel.isTextBased()){
                this.voice.set(channel.id, channel);
            }
        });
    }
}