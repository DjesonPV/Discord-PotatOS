import * as DiscordJs                   from "discord.js";
import MessageSafeDelete                from "../botModules/MessageSafeDelete.mjs";
import displayMusicDisplayer            from "../botModules/MusicDisplayer.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import * as LANG from "../Language.mjs";

// _______________________________
//
// Stop

/** @param {DiscordJs.ButtonInteraction} interaction */
export function PotatOSMusicPlayerStop(interaction){
    if(!isConnectedToAMusicPlayer(interaction)) {
        interaction.deferUpdate();
        return;
    }

    let stopRow = new DiscordJs.ActionRowBuilder()
    .addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerStopYESSTOPIT')
        .setLabel(LANG.MUSICDISPLAYER_STOP_VALIDATION)
        .setStyle(DiscordJs.ButtonStyle.Danger)
        .setEmoji('❕')
    ).addComponents(
        new DiscordJs.ButtonBuilder()
        .setCustomId('PotatOSMusicPlayerStopDONT')
        .setLabel(LANG.MUSICDISPLAYER_STOP_KEEPPLAYING)
        .setStyle(DiscordJs.ButtonStyle.Secondary)
        .setEmoji('🎧')
    );

    let toSend = {};
        toSend.content = LANG.MUSICDISPLAYER_STOP_QUESTION;
        toSend.components = [stopRow];
        toSend.ephemeral = true;

        itr.reply(toSend);

        const filter = button => (button.customId === 'PotatOSMusicPlayerStopYESSTOPIT' || button.customId === 'PotatOSMusicPlayerStopDONT') && button.user.id === itr.member.id;
        const collector = itr.channel.createMessageComponentCollector({ filter, max : 1});

        collector.on('collect', async i => {
            if (i.customId === 'PotatOSMusicPlayerStopYESSTOPIT') YesStopIt(i);

            itr.editReply({ content: LANG.MUSICDISPLAYER_STOP_REQUEST_RECEIVED, components : []});
        });

}

//
// Stop confirmation

/** @param {DiscordJs.ButtonInteraction} interaction */
function YesStopIt(interaction){
    if (!interaction.member.voice.channel) {
        return;
    }
    if(isConnectedToAMusicPlayer(interaction)) {
        const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
        if (subscription) subscription.destroy();
        return;
    }
}

// _______________________________
//
// test for MusicPlayerConnection
// (should be absctracted into subscription.isUserConnected(user))

/** @param {DiscordJs.ButtonInteraction} interaction */
function isConnectedToAMusicPlayer(interaction){
    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
    if (subscription) {
    if ( // If GuildMember is in the same VoiceChannel as a MusicSubscription and the command comes from the right server
        (interaction.member.voice.channel.id === subscription.voiceChannel.id) && 
        (interaction.member.guild.id === interaction.guild.id)
    )
    return true;
    }
    return false;
}

// _______________________________
//
// Skip

/** @param {DiscordJs.ButtonInteraction} interaction */
export function PotatOSMusicPlayerSkip(interaction){
    if(!isConnectedToAMusicPlayer(interaction)) {
        interaction.deferUpdate();
        return;
    }

    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
    if (subscription) {
        subscription.skip();
        interaction.deferUpdate();
    }
}

// _______________________________
//
// Player Refresh or Delete

/** @param {DiscordJs.ButtonInteraction} interaction */
export function PotatOSMusicPlayer(interaction){
    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
    if (!subscription) {
        MessageSafeDelete.deleteMessage(interaction.message);
        return;
    }
        displayMusicDisplayer(interaction.message.channel);
        interaction.deferUpdate();
}

// _______________________________
//
// Play Pause

/** @param {DiscordJs.ButtonInteraction} interaction */
export function PotatOSMusicPlayerPlayPause(interaction){
    if(!isConnectedToAMusicPlayer(interaction)) {
        interaction.deferUpdate();
        return;
    }

    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
    if (subscription) {
        if (subscription.isPaused()) subscription.resume(); 
        else subscription.pause();
        displayMusicDisplayer(interaction.message.channel);
        interaction.deferUpdate();
    }
}
