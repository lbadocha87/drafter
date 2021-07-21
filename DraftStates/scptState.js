const dispatcher = require('./statesDispatcher.js');
const pickingState = require('./pickingState.js');

module.exports = class ScptState {
  constructor(draftPool, playerDeals) {
    this.draftPool = draftPool;
    this.picks = new Array();
    this.nomination = new Array();
    this.limbo = new Array();
    this.ban = new Array();
    for(var i = 0; i<playerDeals.length; i++) {
      this.picks = this.picks.concat(playerDeals[i].picked);
      this.limbo = this.limbo.concat(playerDeals[i].factions);
      this.ban = this.ban.concat(playerDeals[i].banned);
    }

    this.currentPlayer = null;
    this.currentIndex = -1;
  }

  onStateEnter() {
    var log = "-----=====-----\nSCPT nominating phase";
    log = log + "\nOrder:\n" + this.draftPool.getPlayersOrder() +'\n';
        dispatcher.log(log);

    this.setCurrentPlayer();
    this.logState();
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
    this.currentIndex++;
    if(this.currentIndex >= this.draftPool.players.length) {
      this.draftPool.factions = this.picks;
      dispatcher.newState(new pickingState(this.draftPool));
      return false;
    }
    this.currentPlayer = this.draftPool.players[this.currentIndex];
    return true;
  }

  logState() {
    var log = "\n\nPick pool: " + this.factionsToString(this.picks);
    log = log + "\nNominations: " + this.factionsToString(this.nomination);
    log = log + "\nLimbo: " + this.factionsToString(this.limbo);
    log = log + "\nBanned: " + this.factionsToString(this.ban);

    log = log + "\n\n" + `${this.currentPlayer} your turn. Type "!nominate <name>" to move faction from limbo to nominatations or "!pick <name>" to move faction from nominations to pick pool`;
    dispatcher.log(log);
  }

  process(command) {
    if(command.author == this.currentPlayer && command.content.startsWith("!")) {
      if(this.pickOrNominate(command)) {
        if(this.setCurrentPlayer()) {
          this.logState();
        }
      }
    }
  }

  pickOrNominate(command) {
    var comm = command.content.split(' ')[0];
    var args = command.content.replace(comm,'').trim();
    if(comm == "!pick") {
      return this.pick(args);
    } else if (comm == "!nominate") {
      return this.nominate(args);
    }
    return false;
  }

  pick(args) {
      for (var i = 0; i <this.nomination.length; i++) {
        if(this.nomination[i].name == args) {
          this.picks.push(this.nomination[i]);
          this.nomination.splice(i,1);
          return true;
        }
      }
      dispatcher.log(`No faction "${args}" in nominations pool!`);
      return false;
  }

  nominate(args) {
      for (var i = 0; i <this.limbo.length; i++) {
        if(this.limbo[i].name == args) {
          this.nomination.push(this.limbo[i]);
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