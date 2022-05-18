
import {MessageActionRow, MessageButton, Client} from "discord.js";
import {MusicSubscription} from "../voice/MusicSubscription.mjs";

export function PotatOSMusicPlayerStop(itr){
    if(!isConnectedToAMusicPlayer(itr)) {
        itr.deferUpdate();
        return;
    }

    let stopRow = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setCustomId('PotatOSMusicPlayerStopYESSTOPIT')
        .setLabel(`Arrêter et supprimer la playlist en cours wesh`)
        .setStyle('DANGER')
        .setEmoji('❕')
    ).addComponents(
        new MessageButton()
        .setCustomId('PotatOSMusicPlayerStopDONT')
        .setLabel(`Laisser la musique`)
        .setStyle('SECONDARY')
        .setEmoji('🎧')
    );

    let toSend = {};
        toSend.content = `Es-tu sûr de vouloir arrêter le lecteur de musique ?`;
        toSend.components = [stopRow];
        toSend.ephemeral = true;

        itr.reply(toSend);


        const filter = button => (button.customId === 'PotatOSMusicPlayerStopYESSTOPIT' || button.customId === 'PotatOSMusicPlayerStopDONT') && button.user.id === itr.member.id;
        const collector = itr.channel.createMessageComponentCollector({ filter, max : 1});

        collector.on('collect', async i => {
            if (i.customId === 'PotatOSMusicPlayerStopYESSTOPIT') YesStopIt(i);

            i.update({ content: 'Requête prise en compte !', components : []});       
        });

}

function isConnectedToAMusicPlayer(itr){
    if ((itr.member.voice.channel.id === MusicSubscription.getSubscription(itr.member.guild.id).voiceChannelId) && (itr.member.guild.id === itr.guild.id) )
    // If GuildMember is in the same VoiceChannel as a MusicSubscription and the command comes from the right server
    return true;
    return false;
}

function YesStopIt(itr){
    if (!itr.member.voice.channel) {
        return;
    }
    if(isConnectedToAMusicPlayer(itr)) {
        MusicSubscription.getSubscription(itr.member.guild.id).destroy();
        return;
    }
}
