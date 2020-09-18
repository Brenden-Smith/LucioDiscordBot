// Practice JS project created using: https://gabrieltanner.org/blog/dicord-music-bot

// Dependencies
const Discord = require('discord.js');
const {
    prefix,
    token,
} = require('./config.json');
const ytdl = require("ytdl-core");

// Client & login
const client = new Discord.Client();
client.login(token)

// Basic listeners
client.once('ready', () => {
    console.log('Good as new!')
});
client.once('reconnecting', () => {
    console.log('Raising the volume...');
});
client.once('disconnect', () => {
    console.log('Moving out!');
});

// Reading messages
client.on('message', async message => {
    if (message.author.bot) return; // Ignore bot messages
    if (!message.content.startsWith(prefix)) return; // Check for prefix

    const serverQueue = queue.get(message.guild.id);
    
    // Commands

    if (message.content.startsWith('${prefix}play')) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith('${prefix}skip')) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith('${prefix}stop')) {
        stop(message, serverQueue);
        return;
    } else {
        message.channel.send("Why are you so angry?");
    }
});

// Adding songs

const queue = new Map();

async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel; // Test for voice channel
    if (!voiceChannel)
        return message.channel.send("That's not right! You need to be in a voice channel to summon me.");
    const permissions = voiceChannel.permissionsFor(message.client.user); // Test for permissions
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channe.send("That's not right! I don't have permission to join and speak in your voice channel");
    }
}

// Song class

const songInfo = await ytdl.getInfo(args[1]);
const song = {
    title: songInfo.title,
    url: songInfo.video_url,
};

if (!serverQueue) { // Check for serverQueue
} else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send('${song.title} is my jam!');
}

// Creating contract for our queue
const queueContruct = {
    textChannel: message.channel,
    voiceChannel: voiceChannel,
    connection: null,
    songs: [],
    volume: 5,
    playing: true,
};
// Setting the queue using our contract
queue.set(message.guild.id, queueContruct);
// Pushing song to our songs array
queueContruct.songs.push(song);

try {
    // Attempt to join voicechat and save our connection into object
    var connection = await voiceChannel.join();
    queueContruct.connection - connection;
    // Call play function to start song
    play(message.guild, queueContruct.songs[0]);
} catch (err) {
    // Print error message if bot fails to join channel
    console.log(err);
    queue.delete(message.guild.id);
    return message.channel.send(err);
}

// Playing songs //

// Check if song is empty
function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }
    }
}

const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
serverQueue.textChannel.send('Move to the beat: **${song.title}**');

// Skipping songs
function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("That's not right! You need to be in a voice channel to skip the music.");
    if (!serverQueue)
        return message.channel.send("That's not right! There is no song that I could skip");
}

// Stopping songs
function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("That's not right! You need to be in a voice channel to stop the music.");
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}
