const Discord = require('discord.js');
const dispatcher = require('./DraftStates/statesDispatcher.js');
const keep_alive = require('./keep_alive.js');
const client = new Discord.Client({
fetchAllMembers: false, // Remove this if the bot is in large guilds.
presence: {
     status: 'online',
     activity: {
       name: `!setup`,
       type: 'LISTENING'
     }
   }
 });
 
 const token = process.env.DISCORD_BOT_SECRET;


 client.on('ready', () => {
   console.log("I'm in");
   console.log(client.user.username);
   dispatcher.setClient(client);
 });


 client.on('message', msg => {
   try {
     if (msg.author.id != client.user.id) {
         dispatcher.dispatch(msg);
         //msg.channel.send(msg.content.split('').reverse().join(''));
     }
  } catch(error) {
     console.log(error);
   }

 });

 client.login(token);
