//import * as LANG from "../Language.mjs";

// SCREAMING_SNAKE_CASE to distinguish them well in code

// BOT __________________

export const BOT_NAME = `PotatOS`;
export const BOT_ICON = `https://media.discordapp.net/attachments/329613279204999170/970392014296338432/PotatOS_logo.png`;
export const BOT_IS_ONLINE = (botName) => `${botName} est en ligne`;// {} is online
export const BOT_CHANNELS_FOUND = (nbTextChannels, nbVoiceChannels, nbGuilds) => `${nbTextChannels} cannaux textuels et ${nbVoiceChannels} cannaux vocaux trouvés dans ${nbGuilds} serveurs`; // Found {} TextChannels and {} VoiceChannels 
export const BOT_READY = `Prêt !`; // Ready!

// SlashCommands _____________________

export const SLASHCOMMANDS_REFRESH_START = `Mise à jour des commandes (/)...`; // Started refreshing application (/) commands.
export const SLASHCOMMANDS_REFRESH_SUCCESS = `Commandes (/) mises à jour avec succès !`; // Successfully reloaded application (/) commands.

// MessagePrintReply ___________________

export const MSG_AUTODESTRUCT = (duration) => `Ce message s'autodétruira dans ${duration} secondes`; //This message will be deleted in {} secondes
export const MSG_CHANNEL_NOT_SUPPORTED = (channelName, guildName) => `Le TextChannel [${channelName}] de la Guild [${guildName}] n'est pas géré !!`; // The [{}] TextChannel of [{}] Guild is not supported!!

// MusicDisplayer ____________________

export const MUSICDISPLAYER_VIEWS_BILLION   = ` Md de vues`; // Billion(s) of views
export const MUSICDISPLAYER_VIEWS_MILLION   = ` M de vues`; // Million(s) of views
export const MUSICDISPLAYER_VIEWS_THOUSAND  = ` k vues`; // Thousand(s) of views
export const MUSICDISPLAYER_VIEWS_UNIT      = ` vues`; // views 
export const MUSICDISPLAYER_VIEWS_UNKNOWN   = `--- vues`; // views

export const SHORT_MONTHS_ARRAY = [`janv.`, `févr.`, `mars`, `avr.`, `mai`, `juin`, `juill.`, `août`, `sept.`, `oct.`, `nov.`, `déc.`];
export const DATE_TEXT_FORMAT = (year, month, day) => `${day} ${SHORT_MONTHS_ARRAY[month]} ${year}`;

export const MUSICDISPLAYER_NAME    = `${BOT_NAME} Music Player`
export const MUSICDISPLAYER_PLAY    = `Jouer`;
export const MUSICDISPLAYER_PAUSE   = `Pause`;
export const MUSICDISPLAYER_SKIP    = `Skip`;
export const MUSICDISPLAYER_STOP    = `Stop`;

export const MUSICDISPLAYER_SHOW_PLAYLIST = (playlistLength) => `Afficher la playlist [${playlistLength}]`;
export const MUSICDISPLAYER_COMMAND_CALLED_SOUND = (commandName) => `Appelé avec la command [${commandName}]`;
export const MUSICDISPLAYER_THROUGH_COMMAND = `Via la commande`;
export const MUSICDISPLAYER_WEB_LINK = `Lien Internet`;
export const MUSICDISPLAYER_LOADING = `C h a r g e m e n t . . .`; // L o a d i n g . . .
export const MUSICDISPLAYER_LOADING_PLEASE_WAIT = `\`\`\`fix\nVeuillez patientez.\nRécupération des données à afficher...\n\`\`\``;
export const MUSICDISPLAYER_LOADING_PLAYLIST_DESC = `Récupération des données à afficher...`;

export const MUSICDISPLAYER_STOP_VALIDATION = `Arrêter et supprimer la playlist en cours`;
export const MUSICDISPLAYER_STOP_KEEPPLAYING = `Laisser la musique`;
export const MUSICDISPLAYER_STOP_QUESTION = `Es-tu sûr de vouloir arrêter le lecteur de musique ?`;
export const MUSICDISPLAYER_STOP_REQUEST_RECEIVED = `Requête prise en compte !`;

export const MUSICDISPLAYER_BOT_ICON = BOT_ICON;
export const MUSICDISPLAYER_WEB_ICON = `https://media.discordapp.net/attachments/329613279204999170/975538715223003176/logoWWW.png`;
export const MUSICDISPLAYER_RADIO_ICON = `https://radio.garden/icons/favicon.png`;
export const MUSICDISPLAYER_BOT_COLOR = `#FFB46B`;
export const MUSICDISPLAYER_WEB_COLOR = `#000000`;
export const MUSICDISPLAYER_RADIO_COLOR = `#0FF388`;
export const MUSICDISPLAYER_DEFAULT_THUMBNAIL = `https://cdn.discordapp.com/attachments/970417796729143316/1002583819683102770/PotatOS_black_and_white.png`;
export const MUSICDISPLAYER_RADIO_THUMBNAIL = `https://media.discordapp.net/attachments/970417796729143316/1006689396805861427/unknown.png`

export const MUSICDISPLAYER_LOADING_ASCII_ART = 
`\`\`\`
                !
                |
                |    |~/
                |   _|~
  .============.|  (_|   |~/
.-;____________;|.      _|~
| [_________I__] |     (_|
|  """"" (_) (_) |
| .=====..=====. |
| |:::::||:::::| |
| '=====''=====' |
'----------------'
\`\`\``
;
export const MUSICDISPLAYER_FOOTER = (guildName, channelName) => `__________________________________________\n${BOT_NAME} • ${guildName} > ${channelName}`;
export const MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_TITLE = `Morceau Inconnu`;
export const MUSICDISPLAYER_PLAYLIST_UNKNOWN_TRACK_DESC = `Une erreur est survenue`;
export const MUSICDISPLAYER_PLAYLIST_ASK_WHAT_TO_DO = `Que veux tu faire avec cet élément de la playlist ?`;
export const MUSICDISPLAYER_PLAYLIST_DO_NOTHING = `Annuler`;
export const MUSICDISPLAYER_PLAYLIST_PLAY_NEXT = `Placer en tête de la playlist`;
export const MUSICDISPLAYER_PLAYLIST_REMOVE = `Retirer de la playlist`;

// ERRORS

export const ERROR_TRACK = (error) => `Erreur : ${error}`;
export const ERROR_PLAY_TRACK = `Je n'ai pas réussi à jouer ton morceau`;
export const ERROR_NO_AUDIO_MEDIA = `Aucune vidéo trouvée à cette adresse`;
export const ERROR_NO_STREAM = `Échec lors de la création du flux`;
export const ERROR_VOICECHANNEL_CONNECTION = `Je n'ai pas réussi à me connecter, réessaie plus tard !`;
export const ERROR_ICON = `https://cdn.discordapp.com/attachments/329613279204999170/970413892792623204/Error_icon.png`;
export const ERROR_VOICE_CONNECTION = `Impossible de se connecter à un Salon Vocal`;

// = = = = = = = = = = =
// COMMANDS / starts whith an underscore
// = = = = = = = = = = =

export const _HELLO_DESC = `Dire bonjour à ${BOT_NAME}`;
export const _HELLO_HI = `Salut`;

export const _PING_DESC = `Pong (envoie un message en privé)`;

export const _PLAYSOUND_CMDNAME = `son`;
export const _PLAYSOUND_DESC = `Joue un son dans le Salon Vocal auquel tu es connecté`;
export const _PLAYSOUND_OPTION_NAME = `sample`;
export const _PLAYSOUND_OPTION_DESC = `Nom du son à jouer`;

export const _MUSICPLAYER_NOT_CONNECTED = `Tu dois rejoindre un Salon Vocal (ou le même que ${BOT_NAME}) sur ce Serveur pour utiliser cette commande`;

export const _SKIP_DESC = `${BOT_NAME} Music Player : SKIP | Skip la musique actuelle et joue la suivante (le cas échéant)`;
export const _STOP_DESC = `${BOT_NAME} Music Player : STOP | Met fin au lecteur de musique`;
export const _PAUSE_DESC = `${BOT_NAME} Music Player : PAUSE | Met en pause le lecteur de musique`;
export const _PLAY_DESC = `${BOT_NAME} Music Player : PLAY | (Re)lance le lecteur de musique ou y ajoute une musique`;
export const _PLAY_QUERY_DESC = `URL du média à jouer ou texte à chercher sur YouTube`;
export const _RADIO_DESC = `${BOT_NAME} Music Player : RADIO | Ajoute une radio au lecteur de musique`;
export const _RADIO_QUERY_DESC = `Recherche par nom de radio ou directement un lien de station sur Radio Garden`;

export const _PLAY_SEARCH_NO_RESULT = (query) => `Aucune vidéo trouvée pour {${query}}`;
export const _PLAY_SEARCH_ERROR = `Problème lors de la recherche`;
export const _RADIO_LINK_NOT_VALID = (query) => `L'URL fournie n'est pas un lien de station de Radio Garden : ${query}`;

export const _SASS_PC_CMDNAME = `pc`; // pc short for Personal Computer
export const _SASS_PC_DESC = `Demande à Nathan quand est-ce qu'il reçoit son ordinateur.`; // Ask Nathan when will his computer will be delivered
export const _SASS_PC_SENTENCES = [
    `Alors il est bien ton pc Nathan ?`,    // Private Joke : Nathan, how well is your computer?
    `Alors Nathan ce pc ?`,                 // Private Joke : So, Nathan, what's up with the new computer?
    `Il arrive quand ton pc ?`              // Private Joke : Again, when does your computer is delivered?
];

export const _SASS_PK_CMDNAME = `pk`; // pk short for "pourquoi" ("why" in French) and a word play between previous function pc and nickname starting with K 
export const _SASS_PK_DESC = `Demande la direction pour trouver l'être cher`; // Ask for direction to your soulmate
export const _SASS_PK_SENTENCE = `Quel est le chemin le plus court pour aller vers ton coeur ?`; // Private Joke : What's the shortest path to your heart?

export const _DAMMIT_CMDNAME = `putain`; // dammit
export const _DAMMIT_DESC = `PREND ÇA !` // TAKE THAT!

export const _SHIFUMI_VICTORY_SENTENCES = [
    `Aucun aléatoire, que du talent.`,              // Nothing random, skils.
    `Moins d'energie et poutant plus efficace.`,    // Smart power and smarter logic.
    `Humain == nul, Patate++`                       // Human == trick, Potato++
];
export const _SHIFUMI_DEFEAT_SENTENCES = [
    `Purée...`,                                     // Mashed...
    `Sûrement une erreur de calcul...`,             // Surely a math error...
    `Triche évidente !`                             // Obvious cheat!
];
export const _SHIFUMI_DRAW_SENTENCES = [
    `Les grands esprits se recontrent.`,                    // Great minds think alike.
    `Même puissance de calcul, et je suis une patate !`,    // Same brain power and I'm a potato !
    `Je suis quatre univers parallèles devant toi !`        // I'm four parallel universes ahead of you!
];
export const _SHIFUMI_BOT_EMOJI = `:potato:`; // 🥔
export const _SHIFUMI_CMDNAME = `shifumi`;
export const _SHIFUMI_DESC = `Joue à Pierre-Feuille-Ciseaux contre ${BOT_NAME}`; // Play Rock-Paper-Scissors against PotatOS
export const _SHIFUMI_PLAY_DESC = `Pierre, Feuille, ou Ciseaux`; // Rock, Paper, or Scissors
export const _SHIFUMI_PLAY_ROCK     = `✊ Pierre`;
export const _SHIFUMI_PLAY_PAPER    = `✋ Feuille`;
export const _SHIFUMI_PLAY_SCISSORS = `✌ Ciseaux`;

export const _MATHS_CMDNAME         = `maths`;
export const _MATHS_DESC            = `Calcul des constantes mathématiques`;
export const _MATHS_CONSTANT_NAME   = `constant`;
export const _MATHS_CONSTANT_DESC   = `Choix de la constante à calculer`;
export const _MATHS_CONSTANT__PI    = `pi`;
export const _MATHS_CONSTANT__TAU   = `tau`;
export const _MATHS_CONSTANT__PHI   = `phi`;
export const _MATHS_CONSTANT__ONE   = `un`;
export const _MATHS_CONSTANT__EXP   = `exp`;
export const _MATHS_CONSTANT__LOG_E = `ln`;
export const _MATHS_NUMBER_NAME     = `number`;
export const _MATHS_NUMBER_DESC     = `exp et ln : nombre réel, phi : nombre entier non nul`;
export const _MATHS_ERROR           = `Bug avec la command \`${_MATHS_CMDNAME}\`, contact un admin !`; 
