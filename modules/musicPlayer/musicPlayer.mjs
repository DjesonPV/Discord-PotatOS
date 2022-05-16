import {MessageEmbed} from "discord.js";
import {MusicSubscription} from "../voice/MusicSubscription.mjs";
import {durationToString, viewsToString, dateToString} from "./valueToString.mjs"
import {printEmbedOnChannel} from "../Bot.mjs";


// Track Display
export function current(args, msg){
    const subscription = MusicSubscription.getSubscription(msg);
    
    if (subscription){
        const playerEmbed = new MessageEmbed();
        const data = subscription.currentTrack.metadata;

        if (data.isYoutube){
            playerEmbed
                .setColor('#FF0000')
                .setTitle(data.title)
                .setURL(data.videoURL)
                .setDescription(`${durationToString(data.duration)} • ${viewsToString(data.viewCount)} • ${dateToString(data.uploadDate)}`)
                .setAuthor({
                    name : data.author,
                    iconURL : data.authorPicture,
                    url : data.authorURL,
                })
                .setThumbnail(data.videoThumbnail)
            ;
        }
        else if (data.isFile){
            playerEmbed
                .setColor('#FFB46B')
                .setAuthor({
                    name : `Appelé avec la commande [${data.key}]`,
                    iconURL : "https://media.discordapp.net/attachments/329613279204999170/970392014296338432/PotatOS_logo.png",
                })
                .setTitle(`${data.title}`)
                .setDescription(`${data.description}`)
            ;

        }else {
            playerEmbed
                .setColor('#20B6E7')
                .setTitle(data.file)
                .setAuthor({
                    name : `${data.source}`,
                    url : `https://${data.source}`,
                    iconURL : "https://media.discordapp.net/attachments/329613279204999170/975538715223003176/logoWWW.png", 
                })
                .setURL(data.url)
                .setDescription(`Lien Internet`)
            ;

        }

        playerEmbed
            .setFooter({
                text : `__________________________________________\nPotatOS • ${msg.guild.name} > ${msg.member.voice.channel.name}`,
            })
        ;

        printEmbedOnChannel(msg.channel, playerEmbed, 20);

    }

}


