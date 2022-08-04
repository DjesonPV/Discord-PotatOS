import * as DiscordJs                   from "discord.js";
import MessageSafeDelete                from "../../botModules/MessageSafeDelete.mjs";
import * as MessagePrintReply           from "../../botModules/MessagePrintReply.mjs"
import displayMusicDisplayer            from "../../botModules/MusicDisplayer.mjs";
import MusicSubscription                from "../../botModules/voice/MusicSubscription.mjs";
import * as LANG from "../../Language.mjs";

// _______________________________
//
// Stop

/** @param {DiscordJs.ButtonInteraction} interaction */
function commandMusicPlayerStop(interaction){
    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
    if (subscription?.isMemberConnected(interaction.member)) {

        let stopButtonsActionRow = new DiscordJs.ActionRowBuilder()
        .addComponents(
            new DiscordJs.ButtonBuilder()
            .setCustomId('PotatOSMusicPlayerStopYESSTOPIT')
            .setLabel(LANG.MUSICDISPLAYER_STOP_VALIDATION)
            .setStyle(DiscordJs.ButtonStyle.Danger)
            .setEmoji('❕')
        )
        .addComponents(
            new DiscordJs.ButtonBuilder()
            .setCustomId('PotatOSMusicPlayerStopDONT')
            .setLabel(LANG.MUSICDISPLAYER_STOP_KEEPPLAYING)
            .setStyle(DiscordJs.ButtonStyle.Secondary)
            .setEmoji('🎧')
        );

        const toSend = {
            content: LANG.MUSICDISPLAYER_STOP_QUESTION,
            components: [stopButtonsActionRow],
            ephemeral: true,
        };

        interaction.reply(toSend);

        const filter = button => {
            return (
                (button.user.id === interaction.member.id) &&
                (
                    (button.customId === 'PotatOSMusicPlayerStopYESSTOPIT') ||
                    (button.customId === 'PotatOSMusicPlayerStopDONT')
                )
            );
        };
        
        const collector = interaction.channel.createMessageComponentCollector({ filter, max : 1});

        collector.on('collect', collectedInteraction => {
            
            if (subscription?.isMemberConnected(collectedInteraction.member)){
                if (collectedInteraction.customId === 'PotatOSMusicPlayerStopYESSTOPIT') {
                    YesStopIt(collectedInteraction.member);
                }
                
                interaction.editReply({ 
                    content: LANG.MUSICDISPLAYER_STOP_REQUEST_RECEIVED, 
                    components : []
                });
                collectedInteraction.deferUpdate();
            }
            else {
                const messageOptions = MessagePrintReply.getAlertMessageOptions(LANG._MUSICPLAYER_NOT_CONNECTED);
                messageOptions.content = "";
                messageOptions.components = [];

                interaction.editReply(messageOptions);
                collectedInteraction.deferUpdate();
            }
           
        });

    } else {
        interaction.deferUpdate();
    }
}

const buttonMusicPlayerStop = (disable) => {
    return new DiscordJs.ButtonBuilder()
        .setCustomId(customIdStop)
        .setLabel(LANG.MUSICDISPLAYER_STOP)
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
    const subscription = MusicSubscription.getSubscription(member.guild.id);

    if (subscription?.isMemberConnected(member)) {
        subscription.stop();
    }
}

// _______________________________
//
// Skip

/** @param {DiscordJs.ButtonInteraction} interaction */
async function commandMusicPlayerSkip(interaction) {
    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);

    if (subscription?.isMemberConnected(interaction.member)) {
        subscription.skip();
    }
    interaction.deferUpdate();
}

const customIdSkip = 'PotatOSMusicPlayerSkip';

const buttonMusicPlayerSkip = new DiscordJs.ButtonBuilder()
    .setCustomId(customIdSkip)
    .setLabel(LANG.MUSICDISPLAYER_SKIP)
    .setStyle(DiscordJs.ButtonStyle.Primary)
    //.setStyle(`${subscription.queue.length>0?DiscordJs.ButtonStyle.Primary:DiscordJs.ButtonStyle.Danger}`)
    .setEmoji('⏭')
;

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
    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
    
    if (!subscription) {
        MessageSafeDelete.deleteMessage(interaction.message);
    } else {
        displayMusicDisplayer(interaction.message.channel);
        interaction.deferUpdate(); 
    }
}

const customIdMusicPlayer = 'PotatOSMusicPlayer';

const buttonMusicPlayer =  new DiscordJs.ButtonBuilder()
    .setCustomId(customIdMusicPlayer)
    .setLabel(LANG.MUSICDISPLAYER_NAME)
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
    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);
    
    if (subscription?.isMemberConnected(interaction.member)) {
        
        if (subscription.isPaused()) {
            subscription.resume(); 
        }
        else { 
            subscription.pause();
        }
        displayMusicDisplayer(interaction.message.channel);
    }
    interaction.deferUpdate();
}

const customIdPlayPause = 'PotatOSMusicPlayerPlayPause';

const buttonMusicPlayerPlayPause = (isPaused, isLoading) => {
    return new DiscordJs.ButtonBuilder()
        .setCustomId(customIdPlayPause)
        .setLabel(`${isPaused?LANG.MUSICDISPLAYER_PLAY:LANG.MUSICDISPLAYER_PAUSE}`)
        .setStyle(`${isPaused?DiscordJs.ButtonStyle.Success:DiscordJs.ButtonStyle.Secondary}`)
        .setEmoji(`${isPaused?'▶':'⏸'}`)
        .setDisabled(isLoading)
    ;
}

export const musicPlayerPlayPause = { 
    button: buttonMusicPlayerPlayPause,
    command: commandMusicPlayerPlayPause,
    customId: customIdPlayPause
};
