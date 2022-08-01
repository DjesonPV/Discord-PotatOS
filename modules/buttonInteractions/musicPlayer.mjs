import * as DiscordJs                   from "discord.js";
import MessageSafeDelete                from "../botModules/MessageSafeDelete.mjs";
import * as MessagePrintReply                from "../botModules/MessagePrintReply.mjs"
import displayMusicDisplayer            from "../botModules/MusicDisplayer.mjs";
import MusicSubscription                from "../voice/MusicSubscription.mjs";
import * as LANG from "../Language.mjs";

// _______________________________
//
// Stop

/** @param {DiscordJs.ButtonInteraction} interaction */
export function PotatOSMusicPlayerStop(interaction){
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
            if (button.user.id === interaction.member.id){
                if (button.customId === 'PotatOSMusicPlayerStopYESSTOPIT') {
                    return true;
                }
                else if (button.customId === 'PotatOSMusicPlayerStopDONT'){
                    return true;
                }
                else {
                    return false;
                }

            } else {
                return false;
            }
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
            }
            else {
                const messageOptions = MessagePrintReply.getAlertMessageOptions(LANG._MUSICPLAYER_NOT_CONNECTED);
                messageOptions.content = "";
                messageOptions.components = [];

                interaction.editReply(messageOptions);
            }
           
        });

    } else {
        interaction.deferUpdate();
    }
}

//
// Stop execution

/** @param {DiscordJs.GuildMember} member */
function YesStopIt(member){
    const subscription = MusicSubscription.getSubscription(member.guild.id);

    if (subscription?.isMemberConnected(member)) {
        subscription.destroy();
    }
}

// _______________________________
//
// Skip

/** @param {DiscordJs.ButtonInteraction} interaction */
export function PotatOSMusicPlayerSkip(interaction){
    interaction.deferUpdate();
    const subscription = MusicSubscription.getSubscription(interaction.member.guild.id);

    if (subscription?.isMemberConnected(interaction.member)) {
        subscription.skip();
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
    } else {
        displayMusicDisplayer(interaction.message.channel);
        interaction.deferUpdate(); 
    }
    
}

// _______________________________
//
// Play Pause

/** @param {DiscordJs.ButtonInteraction} interaction */
export function PotatOSMusicPlayerPlayPause(interaction){
    interaction.deferUpdate();
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
}
