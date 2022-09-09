'use strict';

const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers] });

const magic_channel_name = "Join Me!";
const channel_prefix = "[AC]";
let channel_names = [
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

try {
    channel_names = fs.readFileSync('/etc/discord-autochannel/channel_names').toString().split("\n");
    console.log(`Got ${channel_names.length} channel names from config file`);
}
catch (e) {
    console.warn("Could not read channel names from file, using default names.", e);
}

let managed_channels = [];
client.on('ready', async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.cache.forEach(channel => {
        if (channel.name.startsWith(channel_prefix)) {
            if (channel.members.size > 0) {
                managed_channels.push(channel);
            } else {
                channel.delete();
            }
        }
        if (channel.name === magic_channel_name) {
            channel.members.forEach(member => create_channel_for_member(member, channel));
        }
    });

});

client.on('voiceStateUpdate', async (before, after) => {
    if (before.channel != null && managed_channels.includes(before.channel)) {
        if (before.channel.members.size == 0) {
            managed_channels = managed_channels.filter(channel => channel !== before.channel);
            await before.channel.delete();
        }
    }

    if (after.channel != null && after.channel.name === magic_channel_name) {

        new_channel = create_channel_for_member(after.member, after.channel);

    }

});

async function create_channel_for_member(member, template_channel) {
    new_name = `${channel_prefix} ${channel_names[Math.floor(channel_names.length * Math.random())]}`;
    console.log(`Creating channel: ${new_name}`);
    new_channel = await template_channel.clone({
        name: new_name,
        reason: 'Auto Voice Channel',
        position: 999
    });
    managed_channels.push(new_channel);
    await member.voice.setChannel(new_channel);

    return new_channel;
}

client.login(process.env.DISCORD_TOKEN);
