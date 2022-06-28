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
            if (channel.type == `GUILD_TEXT`){
                this.text.set(channel.name, channel);
            } else
            if (channel.type === `GUILD_VOICE`){
                this.voice.set(channel.name, channel);
            }
        });
    }
}