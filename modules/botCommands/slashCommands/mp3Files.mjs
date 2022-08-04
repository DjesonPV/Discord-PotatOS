import * as Voice from "../../botModules/voice/Voice.mjs";
import * as MP3Files from "../../botModules/voice/MP3Files.mjs";
import * as DiscordJs from 'discord.js';
import MessageSafeDelete from '../../botModules/MessageSafeDelete.mjs';
import * as LANG from "../../Language.mjs";

/** @param {DiscordJs.ChatInputCommandInteraction} interaction */
function cmdSoundSample(interaction){
    const sampleKey = interaction.options.getString('sample');

    MessageSafeDelete.noReply(interaction); 
    Voice.streamVoice(interaction, `${MP3Files.path}${MP3Files.files[sampleKey].file}`, MP3Files.files[sampleKey].volume);
}

const slashSoundSample = new DiscordJs.SlashCommandBuilder()
    .setName(LANG._PLAYSOUND_CMDNAME)
    .setDescription(LANG._PLAYSOUND_DESC)
    .addStringOption(option => option
        .setName(LANG._PLAYSOUND_OPTION_NAME)
        .setDescription(LANG._PLAYSOUND_DESC)
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

