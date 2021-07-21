const dispatcher = require('./statesDispatcher.js');

const scptState = require('./scptState.js');
const twelveState = require('./twelveState.js');

module.exports = class DealState {
    constructor(draftPool) {
    this.draftPool = draftPool;
    this.playersPool = new Array();
    this.playersDone = new Array();
  }
  onStateEnter() {

    this.draftPool.shufflePlayers();
    var log = "-----=====-----\nDraft order:\n" + this.draftPool.getPlayersOrder();
    log += '\nDealing factions to the players...';
    dispatcher.log(log);

    var players = this.draftPool.getPlayers();
    var factions = this.draftPool.getFactions();

    for (var i = 0; i < players.length; i++) {
      var playerFactions = new Array();
      for(var f = 0, len = this.draftPool.deal; f<len;f++) {
        var index = Math.floor(Math.random() * factions.length);
        var faction = factions[index];
        factions.splice(index, 1);
        playerFactions.push(faction);

      }
      var playerPool = new PlayerPool(players[i], playerFactions, this.draftPool.pick, this.draftPool.ban);
      this.playersPool.push(playerPool);
      playerPool.logState();
    }   
  };

  process(command) {

  }

  processDm(command) {
    for(var i = 0; i<this.playersPool.length; i++) {
      if(this.playersPool[i].player == command.author && command.content.startsWith("!")) {
          var comm = command.content.split(' ')[0];
          var args = command.content.replace(comm,'').trim();
        if(this.pickOrBan(this.playersPool[i],comm, args)) {
          this.playersPool[i].logState();
          if(this.playersPool[i].toPick <= 0 && this.playersPool[i].toBan <=0) {
            var player = this.playersPool[i];
            this.playersPool.splice(i,1);
            if(this.playersDone.includes(player) == false) {
              this.playersDone.push(player);

              if(this.playersPool.length == 0){
                dispatcher.log("All players responded!");
                if(this.draftPool.draftType == "scpt") {
                  dispatcher.newState(new scptState(this.draftPool, this.playersDone));              
                } else {
                  dispatcher.newState(new twelveState(this.draftPool, this.playersDone))              
                }
              } else {
                dispatcher.log(`${dispatcher.getUserName(player.player)} responded`); 
              }

            }
          }
        }
      }
    }
  }

  pickOrBan(player, comm, args){
    if(comm == "!pick") {
        return this.pick(player, args);
    } else if(comm == "!ban") {
        return this.ban(player, args);
    }
  }

  pick(player, args) {
    if(player.toPick <= 0) {
      player.player.send("You have chosen needed amount of factions to pick already!");
      return false;
    }
    for(var i = 0; i<player.factions.length; i++) {
      if(player.factions[i].name == args) {
        var faction = player.factions[i];
        player.factions.splice(i,1);
        player.picked.push(faction);
        player.toPick--;
        return true;
      }
    }
      player.player.send(`No faction ${args} in your hand`);
      return false;
  }

  ban(player, args) {
    if(player.toBan <= 0) {
      player.player.send("You have chosen needed amount of factions to ban already!");
      return false;
    }
    for(var i = 0; i<player.factions.length; i++) {
      if(player.factions[i].name == args) {
        var faction = player.factions[i];
        player.factions.splice(i,1);
        player.banned.push(faction);
        player.toBan--;
        return true;
      }
    }
      player.player.send(`No faction ${args} in your hand`);
      return false;

  }
}

  class PlayerPool {
    constructor(player, factions, pick, ban) {
      this.player = player;
      this.factions = factions;
      this.picked = new Array();
      this.banned = new Array();
      this.toPick = pick;
      this.toBan = ban;
    }

    logState(){
      var log = "Your hand:";
    for (var i = 0, len = this.factions.length; i < len; i++) {
        log = log + `  ${this.factions[i].toString()},`;
    }    
    log = log.slice(0, -1);
      log += `\nChosen to pick pool (${this.toPick} left):`;
          for (var i = 0, len = this.picked.length; i < len; i++) {
        log = log + `  ${this.picked[i].toString()},`;
      }
      if(this.picked.length > 0) {
            log = log.slice(0, -1);
      } 
            log += `\nChosen to ban pool (${this.toBan} left):`;
          for (var i = 0, len = this.banned.length; i < len; i++) {
        log = log + `  ${this.banned[i].toString()},`;
      }
      if(this.banned.length > 0) {
            log = log.slice(0, -1);
      } 
      if(this.toPick > 0 || this.toBan > 0){
      log += '\n\nType !pick <name> or !ban <name> here, to add faction to pick or ban pool';
      } else {
              log += '\n\nNominating complete';
      }

      this.player.send(log);
    }
  }