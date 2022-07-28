import * as Voice from "../voice/Voice.mjs";
import * as MP3Files from "../voice/MP3Files.mjs";
import { SlashCommandBuilder } from '@discordjs/builders';
import MessageSafeDelete from '../botModules/MessageSafeDelete.mjs';


function cmdSoundSample(interaction){
    const sampleKey = interaction.options.getString('sample');

    MessageSafeDelete.noReply(interaction); 
    Voice.streamVoice(interaction, `${MP3Files.path}${MP3Files.files[sampleKey].file}`, MP3Files.files[sampleKey].volume);
}

const slashSoundSample = new SlashCommandBuilder()
    .setName('son')
    .setDescription(`Joue un son dans le Salon Vocal auquel tu es connecté`) //##LANG Play a sound sample in the Vocal Channel you're connected to
    .addStringOption(option => option
        .setName('sample')
        .setDescription(`Nom du son à jouer`) //##LANG
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

