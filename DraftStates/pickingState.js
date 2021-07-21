const dispatcher = require('./statesDispatcher.js');

module.exports = class PickingState {
  constructor(draftPool) {
    this.draftPool = draftPool;
    this.snaked = false;
    this.currentPlayer = null;
    this.currentIndex = -1;
    this.players = new Array();
    this.randomizeSpeaker = this.draftPool.speakerInPool == false;
  }
  onStateEnter() {    

    for(var i =0; i<this.draftPool.players.length; i++) {
      this.players.push(new PlayerChoice(this.draftPool.players[i]));
    }
    var log = "-----=====-----\nPicking phase";
        dispatcher.log(log);

    this.setCurrentPlayer();
    this.logState();
  };

  logState() {
    var log = "";
    for(var i = 0; i<this.players.length; i++){
      log = log + this.players[i].getPlayerString() + "\n";
    }
    log = log + "\n" + this.arrayToString(this.draftPool.factions);
    log = log + "\n" + this.arrayToString(this.draftPool.slices);
    if(this.draftPool.speakerInPool) {
      log = log + "\n" + this.speakerString();
    }

    log = log + "\n\n" + `${this.currentPlayer.player} your turn. Type "!pick <name>" to pick faction, slice or speaker token (if in pool)`;
    dispatcher.log(log);
  }

  logResult() {
    var log = "-----=====-----\nDraft done!\n";
    for(var i = 0; i<this.players.length; i++){
      log = log + this.players[i].getPlayerResult() + "\n";
    }

    dispatcher.log(log);
  }

  speakerString() {
     return `${dispatcher.getEmote("token")} speaker`;
  }

  setCurrentPlayer() {
    if(this.snaked) {
      this.currentIndex--;
    } else {
      this.currentIndex++;
    }
    if(this.snaked && this.currentIndex <= -1){
      for(var i = 1; i<this.players.length; i++){
        if(this.players[i].faction == null || this.players[i].slice == null) {
          this.currentPlayer = this.players[i];
          return true;
        }
      }
      this.randomizeToken();
      this.logResult();
      dispatcher.reset();
      return false
    }
    if(this.currentIndex >= this.players.length) {
      this.currentIndex--;
      this.snaked = true;
    }
    this.currentPlayer = this.players[this.currentIndex];
    return true;
  }

  randomizeToken() {
    if(this.randomizeSpeaker) {
        var index = Math.floor(Math.random() * this.players.length);
        var player = this.players[index];
        dispatcher.log(`${player.player} was randomized as speaker`);
        player.isSpeaker = true;
    } else if(this.draftPool.speakerInPool) {
      this.players[0].isSpeaker = true;
    }
  }

  process(command) {
    if(command.author == this.currentPlayer.player && command.content.startsWith("!")) {
      var comm = command.content.split(' ')[0];
      var args = command.content.replace(comm,'').trim();
      if(comm == "!pick") {  
        if(this.pick(args)) {
          if(this.setCurrentPlayer()) {
            this.logState();
          }
        } else {
          dispatcher.log(`No "${args}" in pool`);
        }   
      } 
    }
  }

  pick(args) {
    if(args == "speaker") {
      if(this.draftPool.speakerInPool) {
        this.draftPool.speakerInPool = false;
        this.currentPlayer.isSpeaker = true;
        return true;
      } else {
        return false;
      }
    }


    if(this.currentPlayer.faction == null){
      for(var i = 0; i<this.draftPool.factions.length; i++) {
        var faction = this.draftPool.factions[i];
        if(faction.name == args) {
          this.draftPool.factions.splice(i,1);
          this.currentPlayer.faction = faction;
          return true;
        }
      }
    }

    if(this.currentPlayer.slice == null){
      for(var i = 0; i<this.draftPool.slices.length; i++) {
        var slice = this.draftPool.slices[i];
        if(slice.name == args) {
          this.draftPool.slices.splice(i,1);
          this.currentPlayer.slice = slice;
          return true;
        }
      }
    }
    return false;
  }

  processDm(command) {
    
  }

  arrayToString(array) {
    var log = "";
      for (var i = 0; i <array.length; i++) {
        log = log + `  ${array[i].toString()},`;
      }
      if(array.length > 0){
        log = log.slice(0, -1);
      }
      return log.trim();
  }  
}

class PlayerChoice {
  constructor(player) {
    this.player = player;
    this.faction = null;
    this.slice = null;
    this.isSpeaker = false;
  }

  getPlayerString() {
    var log = dispatcher.getUserName(this.player);
    if(this.faction != null){
      log = log + `  ${this.faction.toString()}`;
    }
    if(this.slice != null){
      log = log + `  ${this.slice.toString()}`;
    }
    if(this.isSpeaker) {
       log = log + `  ${dispatcher.getEmote("token")} speaker`;
    }
    return log;
  }

  getPlayerResult() {
    var log = `${this.player}`;
    if(this.faction != null){
      log = log + `  ${this.faction.toString()}`;
    }
    if(this.slice != null){
      log = log + `  ${this.slice.toString()}`;
    }
    if(this.isSpeaker) {
       log = log + `  ${dispatcher.getEmote("token")} speaker`;
    }
    return log;
  }
}