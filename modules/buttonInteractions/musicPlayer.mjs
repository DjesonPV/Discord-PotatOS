import * as DiscordJs                   from "discord.js";
import displayMusicDisplayer            from "../botModules/MusicDisplayer.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";

export function PotatOSMusicPlayerStop(itr){
    if(!isConnectedToAMusicPlayer(itr)) {
        itr.deferUpdate();
        return;
    }

    let stopRow = new DiscordJs.MessageActionRow()
    .addComponents(
        new DiscordJs.MessageButton()
        .setCustomId('PotatOSMusicPlayerStopYESSTOPIT')
        .setLabel(`Arrêter et supprimer la playlist en cours`)      //##LANG : Stop and deleted the current playlist
        .setStyle('DANGER')
        .setEmoji('❕')
    ).addComponents(
        new DiscordJs.MessageButton()
        .setCustomId('PotatOSMusicPlayerStopDONT')
        .setLabel(`Laisser la musique`)     //##LANG : Keep the music running
        .setStyle('SECONDARY')
        .setEmoji('🎧')
    );

    let toSend = {};
        toSend.content = `Es-tu sûr de vouloir arrêter le lecteur de musique ?`;    //##LANG : Are you sure you want to stop the Music Player?
        toSend.components = [stopRow];
        toSend.ephemeral = true;

        itr.reply(toSend);


        const filter = button => (button.customId === 'PotatOSMusicPlayerStopYESSTOPIT' || button.customId === 'PotatOSMusicPlayerStopDONT') && button.user.id === itr.member.id;
        const collector = itr.channel.createMessageComponentCollector({ filter, max : 1});

        collector.on('collect', async i => {
            if (i.customId === 'PotatOSMusicPlayerStopYESSTOPIT') YesStopIt(i);

            i.update({ content: 'Requête prise en compte !', components : []});      //##LANG : Reply received!
        });

}

function isConnectedToAMusicPlayer(itr){
    const subscription = MusicSubscription.getSubscription(itr.member.guild.id);
    if (subscription) {
    if ((itr.member.voice.channel.id === subscription.voiceChannel.id) && (itr.member.guild.id === itr.guild.id) )
    // If GuildMember is in the same VoiceChannel as a MusicSubscription and the command comes from the right server
    return true;
    }
    return false;
}

function YesStopIt(itr){
    if (!itr.member.voice.channel) {
        return;
    }
    if(isConnectedToAMusicPlayer(itr)) {
        const subscription = MusicSubscription.getSubscription(itr.member.guild.id);
        if (subscription) subscription.destroy();
        return;
    }
}

export function PotatOSMusicPlayerSkip(itr){
    if(!isConnectedToAMusicPlayer(itr)) {
        itr.deferUpdate();
        return;
    }

    const subscription = MusicSubscription.getSubscription(itr.member.guild.id);
    if (subscription) {
        subscription.skip();
        itr.deferUpdate();
    }

}

export function PotatOSMusicPlayer(itr){
    const subscription = MusicSubscription.getSubscription(itr.member.guild.id);
    if (!subscription) {
        itr.message.delete().catch(()=>{});
        return;
    }
        displayMusicDisplayer(itr.message.channel);
        itr.deferUpdate();

}
