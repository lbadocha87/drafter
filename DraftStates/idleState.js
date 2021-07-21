const dispatcher = require('./statesDispatcher.js');

const settingState = require('./settingState.js');

module.exports = class IdleState {

  onStateEnter() {
  };

  process(command) {
    if(command.content == "!setup") {
      dispatcher.newState(new settingState(command.author));
    }
  }

  processDm(command) {
    
  }
}