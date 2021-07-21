
var draftChannel = '';
var clientMain = '';
var guild = '';

const idleState = require('./idleState.js');
var currentState = new idleState();

function setClient(client) {
  draftChannel = client.channels.cache.get(process.env.DRAFT_CHANNEL);

  console.log(process.env.DRAFT_CHANNEL);
  guild = client.guilds.cache.get(process.env.GUILD); 
  clientMain = client;
  logToDraftChannel("I'm alive");
}

function dispatchCommand(command) {
  if(command.channel == draftChannel) {
    if(command.content == "!reset") {
      logToDraftChannel("Draft reseted. Type !setup to start again.");
      reset();
    } else {
      currentState.process(command);
    }
  } else if(command.channel.type == "dm") {
    currentState.processDm(command);
  }

}

function reset() {
  currentState = new idleState();
}

function newState(state) {
  currentState = state;
  currentState.onStateEnter();
}

function logToDraftChannel(message) {
  draftChannel.send(message);
}

function getClient() {
  return clientMain;
}

function getEmote(name) {
  var emote = guild.emojis.cache.find(emoji => emoji.name === name);
  if(emote != null){
    return emote;
  } else {
    return "❓";
  }
}

function getUser(player){

}

function getUserName(player) {
  var user = guild.members.cache.find(u => u.user === player);
  if(user != null){
    return user.displayName;
  }
  return player;
}

module.exports.dispatch = dispatchCommand;
module.exports.newState = newState;
module.exports.setClient = setClient;
module.exports.log = logToDraftChannel;
module.exports.getClient = getClient;
module.exports.getEmote = getEmote;
module.exports.getUserName = getUserName;
module.exports.reset = reset;

