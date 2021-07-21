const dispatcher = require('./statesDispatcher.js');
const pickingState = require('./pickingState.js');

module.exports = class TwelveState {
  constructor(draftPool, playerDeals) {
    this.draftPool = draftPool;
    this.picks = new Array();
    this.limbo = new Array();
    this.ban = new Array();
    for(var i = 0; i<playerDeals.length; i++) {
      this.picks = this.picks.concat(playerDeals[i].picked);
      this.limbo = this.limbo.concat(playerDeals[i].factions);
      this.ban = this.ban.concat(playerDeals[i].banned);
    }

    this.currentPlayer = null;
    this.currentIndex = -1;
    this.snake = false;
    this.players = new Array();
  }

  onStateEnter() {
    for(var i =0; i<this.draftPool.players.length; i++) {
      this.players.push(new PlayerNomination(this.draftPool.players[i]));
    }

    var log = "-----=====-----\n12/12 nominating phase (every player moves one faction to the pick and ban pool)";
    log = log + "\nOrder (snake):\n" + this.draftPool.getPlayersOrder() +'\n';
        dispatcher.log(log);

    if(this.setCurrentPlayer()) {
      this.logState();
    }
  };

  factionsToString(factions) {
    var log = "";
      for (var i = 0; i <factions.length; i++) {
        log = log + `  ${factions[i].toString()},`;
      }
      if(factions.length > 0){
        log = log.slice(0, -1);
      }
      return log;
  }

  setCurrentPlayer() {
    if(this.snaked) {
      this.currentIndex--;
    } else {
      this.currentIndex++;
    }
    if(this.snaked && this.currentIndex <= -1 || this.limbo.length == 0){
      this.draftPool.factions = this.picks;
      dispatcher.newState(new pickingState(this.draftPool));
      return false;
    }
    if(this.currentIndex >= this.players.length) {
      this.currentIndex--;
      this.snaked = true;
    }
    this.currentPlayer = this.players[this.currentIndex];
    return true;
  }

  logState() {
    var log = "\n\nPick pool: " + this.factionsToString(this.picks);
    log = log + "\nLimbo: " + this.factionsToString(this.limbo);
    log = log + "\nBanned: " + this.factionsToString(this.ban);

    log = log + "\n\n" + `${this.currentPlayer.player} your turn. Type "!ban <name>" or "!pick <name>" to move faction to ban or pick pool`;
    dispatcher.log(log);
  }

  process(command) {
    if(command.author == this.currentPlayer.player && command.content.startsWith("!")) {
      if(this.pickOrBan(command)) {
        
        if(this.setCurrentPlayer()) {
          this.logState();
        }
      }
    }
  }

  pickOrBan(command) {
    var comm = command.content.split(' ')[0];
    var args = command.content.replace(comm,'').trim();
    if(comm == "!pick") {
      if(this.currentPlayer.picked) {
        dispatcher.log("You already moved faction to pick pool! Type !ban <name>");
        return false;
      } else {
        if(this.pick(args)) {
          this.currentPlayer.picked = true;
          return true;
        } else {
          return false;
        }
      }
    } else if (comm == "!ban") {
      if(this.currentPlayer.banned) {
        dispatcher.log("You already moved faction to ban pool! Type !pick <name>");
        return false;
      } else {
        if(this.banFaction(args)) {
          this.currentPlayer.banned = true;
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }

  pick(args) {
      for (var i = 0; i <this.limbo.length; i++) {
        if(this.limbo[i].name == args) {
          this.picks.push(this.limbo[i]);
          this.limbo.splice(i,1);
          return true;
        }
      }
      dispatcher.log(`No faction "${args}" in limbo!`);
      return false;
  }

  banFaction(args) {
      for (var i = 0; i <this.limbo.length; i++) {
        if(this.limbo[i].name == args) {
          this.ban.push(this.limbo[i]);
          this.limbo.splice(i,1);
          return true;
        }
      }
      dispatcher.log(`No faction "${args}" in limbo!`);
      return false;
  }

  processDm(command) {
    
  }

  
}

class PlayerNomination {
  constructor(player) {
    this.player = player;
    this.banned = false;
    this.picked = false;
  }
}