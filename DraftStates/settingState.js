const dispatcher = require('./statesDispatcher.js');
const draft = require('../draftPool.js');

const dealState = require('./dealCardsState.js');

module.exports = class SettingState {
    constructor(creator) {
    this.creator = creator;
    this.step = 1;
    this.draftPool = new draft();
  }

  onStateEnter() {
    dispatcher.log("Setting up new draft! (type !reset anytime to end draft)");
    dispatcher.log("Step 1: Add players (comma separated or as a list)");
  };

  processDm(command) {
    
  }
  
  process(command) {
    if(command.content == "!pool") {
      this.draftPool.log();
      return;
    }
    if(command.author != this.creator){
      return;
    }
    switch(this.step){
      case 1:
        this.draftPool.addPlayers(command);
        this.step++;
        dispatcher.log("Step 2: Choose draft type (!scpt or !12/12)")
        break;
      case 2:
        if(this.draftPool.setDraftType(command.content)){
          this.step++;
          dispatcher.log("Step 3: Is speaker token in pool? (!yes, !no or !random)")
        }
        break;
      case 3:
        if(this.draftPool.setSpeakerToken(command.content)){
          this.draftPool.log();
          dispatcher.log("Setup completed, type !commands to show how to edit it or !start to deal factions");
          this.step++;
        }
        break;
      case 4:
        if(command.content.startsWith("!")) {
          var comm = command.content.split(' ')[0];
          var args = command.content.replace(comm,'').trim();
          switch(comm) {
            case "!commands":
              var log = "!addplayer <nick> - add discord user to the players\n";
              log += "!removeplayer <nick> - remove player from players list\n";
              log += "!addfaction <id> - add faction to the pool\n";
              log += "!removefaction <id> - remove faction from the pool\n";
              log += "!addslice <color> - add slice to the pool\n";
              log += "!removeslice <color> - removes slice from the pool\n";
              log += "!drafttype <type> - set draft type (\"scpt\" or \"12/12\")\n";
              log += "!speaker <yes/no> - set speaker in pool\n";
              log += "!deal <deal/pick/ban> - specifies how many faction will be dealt and then moved to pick and ban pool, per one player\n";
              log += "!pool - shows all setup elements\n";
              log += "!reset - ends drafting\n";
              log += "!start - starts draft";
              dispatcher.log(log);
              break;
            case "!addplayer":
              this.draftPool.addPlayer(args);
              break;
            case "!removeplayer":
              this.draftPool.removePlayer(args);
              break;
            case "!addfaction":
              this.draftPool.addFaction(args);
              break;
            case "!removefaction":
              this.draftPool.removeFaction(args);
              break;
            case "!addslice":
              this.draftPool.addSlice(args);
              break;
            case "!removeslice":
              this.draftPool.removeSlice(args);
              break;
            case "!drafttype":
              if(this.draftPool.setDraftType(`!${args}`) == false){
                dispatcher.log("Incorrect draft type: "+args);
              }
              break;
            case "!speaker":
              if(this.draftPool.setSpeakerToken(`!${args}`) == false){
                dispatcher.log("Incorrect speaker option: "+args);
              }
              break;
            case "!deal":
              if(this.draftPool.setDeal(args) == false) {
                dispatcher.log("Incorrect deal option: "+args + " - use x/y/z format");
              }
              break;
            case "!start":
              if(this.draftPool.isValid()){
                dispatcher.newState(new dealState(this.draftPool));
              } else {
                dispatcher.log("Incorrect draft setup");
              }
              break;
            default:
              dispatcher.log("Incorrect command: "+comm+" - type !commands to view available commands");
              break;
          }
        }
    }
  }

}
