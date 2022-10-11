'use strict';

const fsPromises = require('fs/promises');
const chokidar = require('chokidar');

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers] });

const MAGIC_CHANNEL_NAME = "Join Me!";
const CHANNEL_PREFIX = "[AC]";
const CHANNEL_NAMES_FILE = "/etc/discord-autochannel/channel_names";

let channelNames = [
    'Eisen 2',
    'ezpz',
    'Holzauge',
    'Inting',
    'Jeeeeenkins!!',
    'Leeeeeroy...!',
    'Need boost!',
    'Olympisch Weitwurf',
    'Sir Feed-a-lot',
    'Sweating',
];



chokidar.watch(CHANNEL_NAMES_FILE, { awaitWritefinish: true }).on('all', (event, path) => {
    setChannelNamesFromFile(path);
});

let managedChannels_ = [];
client.on('ready', async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.cache.forEach(channel => {
        if (channel.name.startsWith(CHANNEL_PREFIX)) {
            if (channel.members.size > 0) {
                managedChannels_.push(channel);
            } else {
                channel.delete();
            }
        }
        if (channel.name === MAGIC_CHANNEL_NAME) {
            channel.members.forEach(member => createChannelForMember(member, channel));
        }
    });

});

client.on('voiceStateUpdate', async (before, after) => {
    if (before.channel != null && managedChannels_.includes(before.channel)) {
        if (before.channel.members.size == 0) {
            managedChannels_ = managedChannels_.filter(channel => channel !== before.channel);
            console.log(`Deleting channel ${before.channel.name}`);
            await before.channel.delete();
        }
    }

    if (after.channel != null && after.channel.name === MAGIC_CHANNEL_NAME) {

        createChannelForMember(after.member, after.channel);

    }

});

async function createChannelForMember(member, template_channel) {
    let new_name = `${CHANNEL_PREFIX} ${channelNames[Math.floor(channelNames.length * Math.random())]}`;
    console.log(`Creating channel ${new_name} for ${member.user.tag}`);
    let new_channel = await template_channel.clone({
        name: new_name,
        reason: 'Auto Voice Channel',
        position: 999
    });
    managedChannels_.push(new_channel);
    await member.voice.setChannel(new_channel);

    return new_channel;
}

function setChannelNamesFromFile(filename) {
    fsPromises.readFile(filename)
        .then(
            function (result) {
                try {

                    let content = result.toString();
                    if (content.length === 0) {
                        throw "No channel names in file.";
                    }
                    channelNames = content.split("\n").filter(name => name.length > 0);
                    console.log(`Got ${channelNames.length} channel names from ${filename}`);
                } catch (e) {
                    console.warn("Could not read channel names from file, using default names.", e);
                }
            }
        )
        .catch(function (e) {
            console.error(e);
        });
}

client.login(process.env.DISCORD_TOKEN);
