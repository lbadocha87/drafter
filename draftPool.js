
const factionsList = require('./factions.js');
const slicesList = require('./slices.js');
const dispatcher = require('./DraftStates/statesDispatcher.js');

module.exports = class DraftPool {
  constructor() {
    this.players = new Array();
    this.slices = slicesList.getAllSlices();
    this.factions = factionsList.getAllFactions();
    this.draftType = "";
    this.speakerInPool = false;
    this.deal = 4;
    this.pick = 1;
    this.ban = 1;
  }

  log(){
    var log = "Draft pools:";
    log = log + '\nPlayers: ';
    for (var i = 0, len = this.players.length; i < len; i++) {
        log = log + ` ${dispatcher.getUserName(this.players[i])},`;
    }   
    log = log.slice(0, -1);

    log = log + '\n\nFactions: ';
    for (var i = 0, len = this.factions.length; i < len; i++) {
        log = log + `  ${this.factions[i].toString()},`;
    }    
    log = log.slice(0, -1);

    log = log + '\n\nSlices: ';
    for (var i = 0, len = this.slices.length; i < len; i++) {
        log = log + `  ${this.slices[i].toString()},`;
    }    
    log = log.slice(0, -1);

    log = log + '\n\nDraft type: ' + this.draftType;
    log = log + '\nSpeaker in pool: ' + (this.speakerInPool ? "yes" : "no");
    log = log + '\nDeal/pick/ban: ' + `${this.deal}/${this.pick}/${this.ban}`;

    dispatcher.log(log);
  }

  addPlayers(players) {
    if(players.content.includes('\n')){
      var splitted = players.content.split('\n');
      for (var i = 0, len = splitted.length; i < len; i++) {
        var playerString = splitted[i];
        if (playerString.match(/^\d/)) {
            playerString = playerString.substring(2);
        }
        this.addPlayer(playerString);
      }
    } else {
      var splitted = players.content.split(',');
      for (var i = 0, len = splitted.length; i < len; i++) {
        this.addPlayer(splitted[i]);
      }
    }
  }

  addPlayer(name) {
    name = name.trim();
    var player = dispatcher.getClient().users.cache.find(user => user.username == name);
    if(player != null){
      this.addToArray(this.players, player);
    } else {
      name = name.replace('<@!','').replace('>','');
      player = dispatcher.getClient().users.cache.get(name);
      if(player != null){
          this.addToArray(this.players, player);
      } else {
        dispatcher.log("Cannot find user: "+name);
      }
    }
  }

  removePlayer(name) {
    name = name.trim();
    var player = dispatcher.getClient().users.cache.find(user => user.username == name);
    if(player != null){
      this.removeFromArray(this.players, player);
    } else {
      name = name.replace('<@!','').replace('>','');
      player = dispatcher.getClient().users.cache.get(name);
      if(player != null){
          this.removeFromArray(this.players, player);
      }
    }
  }

  addToArray(array, object) {
    if(array.includes(object) == false){
      array.push(object);
    }
  }

  removeFromArray(arr, object){
    for( var i = 0; i < arr.length; i++){  
        if ( arr[i] === object) {    
            arr.splice(i, 1);
            return; 
        }    
    }
  }

  addFactions(message) {
    if(message.content == "all") {
      this.factions = factionsList.getAllFactions();
    } else if(message.content == "noPok") {
      this.factions = factionsList.getFactionsFromExpansion("basic");
    }
  }

  addFaction(message) {
    var faction = factionsList.getFaction(message);
    if(faction != null){
      this.addToArray(this.factions, faction);
    } else {
      dispatcher.log("Incorrect faction: "+message);
    }
  }

  removeFaction(message) {
    var faction = factionsList.getFaction(message);
    if(faction != null){
      this.removeFromArray(this.factions, faction);
    } else {
      dispatcher.log("Incorrect faction: "+message);
    }
  }

  addSlice(message) {
    var slice = slicesList.getOrCreate(message);
    this.addToArray(this.slices, slice);
  }

  removeSlice(message) {
    var slice = slicesList.getOrCreate(message);
    this.removeFromArray(this.slices, slice);
  }

  setDraftType(message) {
    if(message == "!scpt") {
      this.draftType = "scpt";
      return true;
    } else if(message == "!12/12"){
      this.draftType = "12/12";
      return true;
    } else {
      return false;
    }
  }

  setSpeakerToken(message) {
    if(message == "!yes") {
      this.speakerInPool = true;
      return true;
    } else if(message == "!no"){
      this.speakerInPool = false;
      return true;
    } else if(message == "!random") {
      this.speakerInPool = Math.random() < 0.5;
      return true;
    } else {
      return false;
    }
  }

  setDeal(message) {
    var nums = message.split("/");
    if(nums.length != 3) {
      return false;
    }
    var num1 = parseInt(nums[0], 10);
    var num2 = parseInt(nums[1], 10);
    var num3 = parseInt(nums[2], 10);

    if(isNaN(num1) || isNaN(num2) || isNaN(num3)){
      return false;
    }
    if(num2+num3 > num1){
      return false;
    }

    this.deal = num1;
    this.pick = num2;
    this.ban = num3;
  }

  isValid() {
    if(this.players.length * this.deal > 24) {
      return false;
    }
    return true;
  }

  getPlayersOrder() {
    var log = '';
    for (var i = 0, len = this.players.length; i < len; i++) {
        log = log + `${this.players[i]}\n`;
    }   
    return log;
  }

  getPlayers() {
    return this.players.map(x=>x);
  }

  getFactions() {
    return this.factions.map(x=>x);
  }

  shufflePlayers(){
    this.players = this.shuffle(this.players);
  }

  shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
  }
}