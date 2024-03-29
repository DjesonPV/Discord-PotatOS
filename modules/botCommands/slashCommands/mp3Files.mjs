import VoiceSubscription from "../../botModules/musicPlayer/VoiceSubscription.mjs";
import * as MP3Files from "../../../assets/mp3FileList.mjs";
import * as DiscordJs from 'discord.js';
import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';
import * as MessagePrintReply from "../../botModules/MessagePrintReply.mjs";
import * as LANG from "../../Language.mjs";

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
async function cmdSoundSample(interaction) {

    const sampleKey = interaction.options.getString(LANG.playsound_OptionName);

    const {subscription, isNew} = VoiceSubscription.create(interaction, sampleKey!=="fortnite");
    if (subscription?.isMemberConnected(interaction.member)) {
        const thinkingMessage = await MessageSafeDelete.startThinking(interaction);
        
        subscription.playlist.replaceCurrent(`${MP3Files.path}${MP3Files.files[sampleKey].file}`, interaction.id, MP3Files.files[sampleKey].volume, "MP3Sample", sampleKey);
        subscription.playlist.fetchCurrentAudio();

        MessageSafeDelete.stopThinking(thinkingMessage); 
    } else {
        MessagePrintReply.replyAlertOnInterarction(interaction, LANG.musicplayerFailedToExecuteCommand);
    }
}

const slashSoundSample = new DiscordJs.SlashCommandBuilder()
    .setName(LANG.playsound_CommandName)
    .setDescription(LANG.playsound_CommandDescription)
    .addStringOption(option => option
        .setName(LANG.playsound_OptionName)
        .setDescription(LANG.playsound_OptionDescription)
        .addChoices(...getSampleChoices())
        .setRequired(true)
    )

;

export const soundSample = {slash: slashSoundSample, command: cmdSoundSample};

function getSampleChoices(){
    const choices = [];

    for (const key in MP3Files.files) {
        if (Object.hasOwnProperty.call(MP3Files.files, key)) {
            choices.push({name : `${key}`, value: `${key}`});
        }
    }
    return choices;
}

