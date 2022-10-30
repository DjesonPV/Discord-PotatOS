import * as fs from 'fs';
import * as Schedule from 'node-schedule';
import * as DiscordJS from 'discord.js';

/**
 * @param {DiscordJS.Client} client 
 * @param {DiscordJS.Snowflake} guildID 
 * @param {DiscordJS.Snowflake} userID 
 */
export async function init (client, guildID, userID) {
    const file = fs.readFileSync("./assets/tikilist.txt", "utf-8");
    const nicknameList = file.split('\n');

    const changeName = () => {           // 24 hours in ms
        const index = Math.floor(Date.now() / 86400000) % nicknameList.length;
 
        client.guilds.fetch(guildID).then(async guild => {
            return guild.members.fetch(userID).then(async member => {
                return member.setNickname(nicknameList[index], `Automatic daily nickname change`);
            })
        }).catch(console.error);
    }

    // Every day of the week @ 00h01
    const rule = new Schedule.RecurrenceRule();
    rule.dayOfWeek = [new Schedule.Range(0,6)]
    rule.hour = 0;
    rule.minute = 1;

    Schedule.scheduleJob(rule, changeName);
}
