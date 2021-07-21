
const dispatcher = require('./DraftStates/statesDispatcher.js');

class Slice {
  constructor(name) {
    this.name = name;
    this.emote = "s_"+name;
  }
}

function sliceToString() {
  return `${dispatcher.getEmote(this.emote)} ${this.name}`;
}
Slice.prototype.toString = sliceToString;

const allSlices = [
  new Slice("yellow"),
  new Slice("red"),
  new Slice("green"),
  new Slice("white"),
  new Slice("blue"),
  new Slice("purple")
]

function getOrCreate(color) {

  for (var i = 0, len = allSlices.length; i < len; i++) {
    if(allSlices[i].name == color){
      return allSlices[i];
    }
  }
  var slice = new Slice(color);
  allSlices.push(slice);
  return slice;
}

function getAllSlices() {
  return allSlices.map(x=>x);
}

module.exports.getAllSlices = getAllSlices;
module.exports.getOrCreate = getOrCreate;