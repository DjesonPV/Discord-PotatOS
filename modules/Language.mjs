//
// BOT
export const botName = `PotatOS`;
export const botIcon = `https://media.discordapp.net/attachments/329613279204999170/970392014296338432/PotatOS_logo.png`;
export const errorIcon = `https://cdn.discordapp.com/attachments/329613279204999170/970413892792623204/Error_icon.png`;

// - - -
// CONSOLE LOG
export const botIsOnline = (botName) => `${botName} est en ligne`;// {} is online
export const logChannelsFound = (nbTextChannels, nbVoiceChannels, nbGuilds) => `${nbTextChannels} cannaux textuels et ${nbVoiceChannels} cannaux vocaux trouvés dans ${nbGuilds} serveurs`; // Found {} TextChannels and {} VoiceChannels 
export const logReady = `Prêt !`; // Ready!
export const logCommandsRefreshStart = `Mise à jour des commandes (/)...`; // Started refreshing application (/) commands.
export const logCommandsRefreshSuccess = `Commandes (/) mises à jour avec succès !`; // Successfully reloaded application (/) commands.

// - - -
// MessagePrintReply
export const messageAutodelete = (duration) => `Ce message s'autodétruira dans ${duration} secondes`; //This message will be deleted in {} secondes
export const messageUnsupportedChannel = (channelName, guildName) => `Le TextChannel [${channelName}] de la Guild [${guildName}] n'est pas géré !!`; // The [{}] TextChannel of [{}] Guild is not supported!!

// - - -
// MusicDisplayer
export const musicdisplayerViewsBillion  = ` Md de vues`; // Billion(s) of views
export const musicdisplayerViewsMillion  = ` M de vues`;  // Million(s) of views
export const musicdisplayerViewsThousand = ` k vues`;     // Thousand(s) of views
export const musicdisplayerViewsUnits    = ` vues`;       // views 
export const musicdisplayerViewsUnknown  = `--- vues`;    // ... views

const dateMonthsShort = [`janv.`, `févr.`, `mars`, `avr.`, `mai`, `juin`, `juill.`, `août`, `sept.`, `oct.`, `nov.`, `déc.`];
export const dateToText = (year, month, day) => `${day} ${dateMonthsShort[month]} ${year}`;

export const musicdisplayerName  = `${botName} Music Player`
export const musicdisplayerPlay  = `Jouer`;
export const musicdisplayerPause = `Pause`;
export const musicdisplayerSkip  = `Skip`;
export const musicdisplayerStop  = `Stop`;

export const musicdisplayerShowPlaylist = (playlistLength) => `Afficher la playlist [${playlistLength}]`;
export const musicdisplayerCommandCalledSoundsample = (commandName) => `Appelé avec la command [${commandName}]`;
export const musicdisplayerThroughCommand = `Via la commande`;
export const musicdisplayerWebLink = `Lien Internet`;

export const musicdisplayerLoading = `C h a r g e m e n t . . .`; // L o a d i n g . . .
export const musicdisplayerPleaseWait = `\`\`\`fix\nVeuillez patientez.\nRécupération des données à afficher...\n\`\`\``;
export const musicdisplayerPlaylistDescriptionLoading = `Récupération des données à afficher...`;

export const musicdisplayerStopValidation = `Arrêter et supprimer la playlist en cours`;
export const musicdisplayerStopKeepPlaying = `Laisser la musique`;
export const musicdisplayerStopQuestion = `Es-tu sûr de vouloir arrêter le lecteur de musique ?`;
export const musicdisplayerStopReceivedAnwser = `Requête prise en compte !`;

export const musicdisplayerRadioIcon = `https://radio.garden/icons/favicon.png`;
export const musicdisplayerBotColor = `#FFB46B`;
export const musicdisplayerNoColor = `#000000`;
export const musicdisplayerRadioColor = `#0FF388`;
export const musicdisplayerDefaultThumbnail = `https://cdn.discordapp.com/attachments/970417796729143316/1002583819683102770/PotatOS_black_and_white.png`;
export const musicdisplayerRadioThumbnail = `https://media.discordapp.net/attachments/970417796729143316/1006689396805861427/unknown.png`
export const musicdisplayerPlayingError = `\n\n\`\`\`diff\n- Impossible de jouer ce média, vérifie la source ou réessaie\n\`\`\``;
export const musicdisplayerLoadingAsciiArt = `\`\`\`\n                !\n                |\n                |    |~/\n                |   _|~\n  .============.|  (_|   |~/\n.-;____________;|.      _|~\n| [_________I__] |     (_|\n|  """"" (_) (_) |\n| .=====..=====. |\n| |:::::||:::::| |\n| '=====''=====' |\n'----------------'\n\`\`\``;
export const musicdisplayerFooter = (guildName, channelName) => `__________________________________________\n${botName} • ${guildName} > ${channelName}`;

export const musicdisplayerPlaylistUnknownTrackTitle = `Morceau Inconnu`;
export const musicdisplayerPlaylistUnknownTrackDescription = `Une erreur est survenue`;
export const musicdisplayerPlaylistSelectionAskAction = `Que veux tu faire avec cet élément de la playlist ?`;
export const musicdisplayerPlaylistSelectionDoNothing = `Annuler`;
export const musicdisplayerPlaylistSelectionOnTop = `Placer en tête de la playlist`;
export const musicdisplayerPlaylistSelectionRemove = `Retirer de la playlist`;

// - - -
// ERRORS
export const musicplayerErrorTrackGeneral = (error) => `Erreur : ${error}`;
export const musicplayerErrorTrackPlay = `Je n'ai pas réussi à jouer ton morceau`;
export const musicplayerErrorNoMediaFound = `Aucune vidéo trouvée à cette adresse`;
export const musicplayerErrorNoMediaStream = `Échec lors de la création du flux`;
export const musicplayerErrorVoiceConnection = `Je n'ai pas réussi à me connecter, réessaie plus tard !`;

// - - -
// COMMANDS ( followed by an underscore )

// > Hi
export const hello_CommandDescription = `Dire bonjour à ${botName}`;
export const hello_Hi = `Salut`;

// > Ping
export const ping_CommandDescription = `Pong (envoie un message en privé)`;

// > SoundSample
export const playsound_CommandName = `son`;
export const playsound_CommandDescription = `Joue un son dans le Salon Vocal auquel tu es connecté`;
export const playsound_InputName = `sample`;
export const playsound_InputDescription = `Nom du son à jouer`;

// > MusicDisplayer
export const musicplayerFailedToExecuteCommand = `Tu dois rejoindre un Salon Vocal (ou le même que ${botName}) sur ce Serveur pour utiliser cette commande`;

export const skip_CommandDescription    = `${botName} Music Player : SKIP | Skip la musique actuelle et joue la suivante (le cas échéant)`;
export const stop_CommandDescription    = `${botName} Music Player : STOP | Met fin au lecteur de musique`;
export const pause_CommandDescription   = `${botName} Music Player : PAUSE | Met en pause le lecteur de musique`;
export const play_CommandDescription    = `${botName} Music Player : PLAY | (Re)lance le lecteur de musique ou y ajoute une musique`;
export const play_OptionDescription     = `URL du média à jouer ou texte à chercher sur YouTube`;
export const radio_CommandDescription   = `${botName} Music Player : RADIO | Ajoute une radio au lecteur de musique`;
export const radio_InputDescription    = `Recherche par nom de radio ou directement un lien de station sur Radio Garden`;

export const play_SearchYieldedNoResult = (query) => `Aucune vidéo trouvée pour {${query}}`;
export const play_SearchingError = `Problème lors de la recherche`;
export const radio_NotValidLink = (query) => `L'URL fournie n'est pas un lien de station de Radio Garden : ${query}`;

// > Shifumi
export const shifumi_SentencesVictory = [
    `Aucun aléatoire, que du talent.`,              // Nothing random, skils.
    `Moins d'energie et poutant plus efficace.`,    // Smart power and smarter logic.
    `Humain == nul, Patate++`                       // Human == trick, Potato++
];
export const shifumi_SentencesDefeat = [
    `Purée...`,                                     // Mashed...
    `Sûrement une erreur de calcul...`,             // Surely a math error...
    `Triche évidente !`                             // Obvious cheat!
];
export const shifumi_SentencesDraw = [
    `Les grands esprits se recontrent.`,                    // Great minds think alike.
    `Même puissance de calcul, et je suis une patate !`,    // Same brain power and I'm a potato !
    `Je suis quatre univers parallèles devant toi !`        // I'm four parallel universes ahead of you!
];
export const shifumi_Emoji = `:potato:`; // 🥔
export const shifumi_CommandName = `shifumi`;
export const shifumi_CommandDescription = `Joue à Pierre-Feuille-Ciseaux contre ${botName}`; // Play Rock-Paper-Scissors against PotatOS
export const shifumi_InputDescription = `Pierre, Feuille, ou Ciseaux`; // Rock, Paper, or Scissors
export const shifumi_InputRock     = `✊ Pierre`;
export const shifumi_InputPaper    = `✋ Feuille`;
export const shifumi_InputScissors = `✌ Ciseaux`;

// > Maths
export const maths_CommandName = `maths`;
export const maths_CommandDescription = `Calcul des constantes mathématiques`;
export const maths_InputName = `constant`;
export const maths_InputDescription = `Choix de la constante à calculer`;

export const maths_InputPi = `pi`;
export const maths_InputTau = `tau`;
export const maths_InputPhi = `phi`;
export const maths_InputOne = `un`;
export const maths_InputExp = `exp`;
export const maths_InputLogE = `ln`;
export const maths_OptionName = `number`;
export const maths_OptionDescription = `exp et ln : nombre réel, phi : nombre entier non nul`;
export const maths_Error = `Bug avec la command \`${maths_CommandName}\`, contact un admin !`; 
