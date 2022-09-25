import * as DiscordJs                   from "discord.js";
import MessageSafeDelete                from "../../botModules/MessageSafeDelete.mjs";
import * as MessagePrintReply           from "../../botModules/MessagePrintReply.mjs"
import VoiceSubscription                from "../../botModules/musicPlayer/VoiceSubscription.mjs";
import * as LANG from "../../Language.mjs";

// _______________________________
//
// Stop

/** @param {DiscordJs.ButtonInteraction} interaction */
function commandMusicPlayerStop(interaction){
    const subscription = VoiceSubscription.get(interaction.member.guild.id);
    
    if (subscription?.isMemberConnected(interaction.member) && !subscription.playlist.hasQueue()) {
        subscription.skip();
    }
    else if (subscription?.isMemberConnected(interaction.member)) {

        const StopButtonIDs = class {
            static YesStopIt = 'PotatOSMusicPlayerStopYESSTOPIT';
            static Dont = 'PotatOSMusicPlayerStopDONT';
        }

        let stopButtonsActionRow = new DiscordJs.ActionRowBuilder()
        .addComponents(
            new DiscordJs.ButtonBuilder()
            .setCustomId(StopButtonIDs.YesStopIt)
            .setLabel(LANG.musicdisplayerStopValidation)
            .setStyle(DiscordJs.ButtonStyle.Danger)
            .setEmoji('❕')
        )
        .addComponents(
            new DiscordJs.ButtonBuilder()
            .setCustomId(StopButtonIDs.Dont)
            .setLabel(LANG.musicdisplayerStopKeepPlaying)
            .setStyle(DiscordJs.ButtonStyle.Secondary)
            .setEmoji('🎧')
        );

        const toSend = {
            content: LANG.musicdisplayerStopQuestion,
            components: [stopButtonsActionRow],
            ephemeral: true,
        };

        interaction.reply(toSend);

        const filter = button => {
            return (
                (button.user.id === interaction.member.id) &&
                ( Object.values(StopButtonIDs).find(id => id === button.customId) !== undefined )
            );
        };
        
        const collector = interaction.channel.createMessageComponentCollector({ filter, max : 1});

        collector.on('collect', collectedInteraction => {
            collectedInteraction.deferUpdate();
            
            if (subscription?.isMemberConnected(collectedInteraction.member)){
                if (collectedInteraction.customId === StopButtonIDs.YesStopIt) {
                    YesStopIt(collectedInteraction.member);
                }
                
                interaction.editReply({ 
                    content: LANG.musicdisplayerStopReceivedAnwser, 
                    components : []
                });
            }
            else {
                const messageOptions = MessagePrintReply.getAlertMessageOptions(LANG.musicplayerFailedToExecuteCommand);
                messageOptions.content = "";
                messageOptions.components = [];

                interaction.editReply(messageOptions);
            }
           
        });

    } else {
        interaction.deferUpdate();
    }
}

/** @param {boolean} disable */
const buttonMusicPlayerStop = (disable) => {
    return new DiscordJs.ButtonBuilder()
        .setCustomId(customIdStop)
        .setLabel(LANG.musicdisplayerStop)
        .setStyle(DiscordJs.ButtonStyle.Danger)
        .setEmoji('◻')
        .setDisabled(disable)
    ;
};

const customIdStop = 'PotatOSMusicPlayerStop';

export const musicPlayerStop = {
    button: buttonMusicPlayerStop,
    command: commandMusicPlayerStop,
    customId: customIdStop
};

//
// Stop execution

/** @param {DiscordJs.GuildMember} member */
function YesStopIt(member){
    const subscription = VoiceSubscription.get(member.guild.id);

    if (subscription?.isMemberConnected(member)) {
        subscription.unsubscribe();
    }
}

// _______________________________
//
// Skip

/** @param {DiscordJs.ButtonInteraction} interaction */
async function commandMusicPlayerSkip(interaction) {
    const subscription = VoiceSubscription.get(interaction.member.guild.id);

    if (subscription?.isMemberConnected(interaction.member)) {
        subscription.skip();
    }
    interaction.deferUpdate();
}

const customIdSkip = 'PotatOSMusicPlayerSkip';

/** @param {boolean} disable */
const buttonMusicPlayerSkip = (disable) => {
    return new DiscordJs.ButtonBuilder()
        .setCustomId(customIdSkip)
        .setLabel(LANG.musicdisplayerSkip)
        .setStyle(DiscordJs.ButtonStyle.Primary)
        //.setStyle(`${subscription.queue.length>0?DiscordJs.ButtonStyle.Primary:DiscordJs.ButtonStyle.Danger}`)
        .setEmoji('⏭')
        .setDisabled(disable)
    ;
}

export const musicPlayerSkip = { 
    button : buttonMusicPlayerSkip,
    command: commandMusicPlayerSkip,
    customId: customIdSkip
};

// _______________________________
//
// Player Refresh or Delete

/** @param {DiscordJs.ButtonInteraction} interaction */
function commandMusicPlayer(interaction) {
    const subscription = VoiceSubscription.get(interaction.member.guild.id);
    
    if (!subscription) {
        MessageSafeDelete.deleteMessage(interaction.message);
    } else {
        subscription.updateMusicDisplayer();
        interaction.deferUpdate(); 
    }
}

const customIdMusicPlayer = 'PotatOSMusicPlayer';

const buttonMusicPlayer =  new DiscordJs.ButtonBuilder()
    .setCustomId(customIdMusicPlayer)
    .setLabel(LANG.musicdisplayerName)
    .setStyle(DiscordJs.ButtonStyle.Secondary)
    .setEmoji('🎧')
;

export const musicPlayer = { 
    button: buttonMusicPlayer,
    command: commandMusicPlayer,
    customId: customIdMusicPlayer
};

// _______________________________
//
// Play Pause

/** @param {DiscordJs.ButtonInteraction} interaction */
async function commandMusicPlayerPlayPause(interaction) {
    const subscription = VoiceSubscription.get(interaction.member.guild.id);
    
    if (subscription?.isMemberConnected(interaction.member)) {
        if (subscription.isPaused) subscription.unpause();
        else subscription.pause();
    }
    interaction.deferUpdate();
}

const customIdPlayPause = 'PotatOSMusicPlayerPlayPause';

/**
 * @param {boolean} isPaused 
 * @param {boolean} isLive 
 * @param {boolean} disable
 */
const buttonMusicPlayerPlayPause = (isPaused, isLive, disable) => {
    return new DiscordJs.ButtonBuilder()
        .setCustomId(customIdPlayPause)
        .setLabel(`${isPaused?LANG.musicdisplayerPlay:LANG.musicdisplayerPause}`)
        .setStyle(`${isPaused?DiscordJs.ButtonStyle.Success:DiscordJs.ButtonStyle.Secondary}`)
        .setEmoji(`${isPaused?(isLive?'▶':'▶'):(isLive?'⏏':'⏸')}`)
        .setDisabled(disable)
    ;
}

export const musicPlayerPlayPause = { 
    button: buttonMusicPlayerPlayPause,
    command: commandMusicPlayerPlayPause,
    customId: customIdPlayPause
};
