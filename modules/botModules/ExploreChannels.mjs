import * as DiscordJs from "discord.js";

export default class channels{

    /** @type {Map<DiscordJs.Snowflake, DiscordJs.TextChannel>} */
    static text  = new Map();
    /** @type {Map<DiscordJs.Snowflake, DiscordJs.VoiceChannel>} */
    static voice = new Map();
    /** @type {Map<DiscordJs.Snowflake, DiscordJs.Guild>} */
    static guilds = new Map();

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
            } else if (channel.type === DiscordJs.ChannelType.GuildVoice){
                this.voice.set(channel.id, channel);
            }
        });

        client.guilds.cache.forEach( guild => {
            this.guilds.set(guild.id, guild);
        })
    }
}