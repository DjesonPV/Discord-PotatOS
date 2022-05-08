import {MessageActionRow, MessageButton, MessageSelectMenu} from "discord.js";

export function testFollowup(itr){

    let testRow = new MessageActionRow()
    .addComponents(
    new MessageSelectMenu()
        .setCustomId('Playlist')
        .setPlaceholder("Playlist")
        .setMaxValues(1)
        .setMinValues(1)
        .addOptions([
            {
                label: "Never Gonna Give you Up Never Gonna let you down nerver gonna turn around and hurt you",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '0',
                emoji : '🎶',
                default : false, 
            },
            {
                label: "Never Gonna Give you Up Never Gonn",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '1',
                emoji : '⏭',
                default : false, 
            },
            {
                label: "Never Gonna Give you Up",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '2',
                emoji : '2️⃣',
            },
            {
                label: "Never Gonna Give you Up",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '3',
                emoji : '3️⃣',
            },
            {
                label: "Never Gonna Give you Up",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '4',
                emoji : '4️⃣',
            },
            {
                label: "Never Gonna Give you Up",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '5',
                emoji : '4️⃣',
            },
            {
                label: "Never Gonna Give you Up",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '6',
                emoji : '4️⃣',
            },
            {
                label: "Never Gonna Give you Up",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '7',
                emoji : '4️⃣',
            },
            {
                label: "Never Gonna Give you Up",
                description: "Rick Astley • 3:05 • 30 vues • 20/64/1320",
                value : '8',
                emoji : '4️⃣',
            },
        ])  
    );

    let testRow2 = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setCustomId('PotatOSMusicPlayer')
        .setLabel(`PotatOS Music Player`)
        .setStyle('SECONDARY')
        .setEmoji('🎧')
    ).addComponents(
        new MessageButton()
        .setCustomId('PotatOSMusicPlayerSkip')
        .setLabel(`Skip`)
        .setStyle('PRIMARY')
        .setEmoji('⏭')
    ).addComponents(
        new MessageButton()
        .setCustomId('PotatOSMusicPlayerStop')
        .setLabel(`Stop`)
        .setStyle('DANGER')
        .setEmoji('◻')

    );

    let testRow3 = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setCustomId('deleteNotif')
        .setLabel(`Effacer ce message`)
        .setStyle('SECONDARY')
        .setEmoji('🚮')
    );

let toSend = {};
toSend.components = [testRow,testRow2, testRow3];


itr.channel.send(toSend).catch(console.log);
itr.deferUpdate();

//itr.message.delete();

}

import {testbutton} from "../Bot.mjs";
export function test(args, msg){
    testbutton(msg.channel);
}

