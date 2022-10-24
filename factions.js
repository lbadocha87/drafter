
const dispatcher = require('./DraftStates/statesDispatcher.js');

class Faction {
  constructor(name, expansion) {
    this.name = name;
    this.emote = "f_"+name+"";
    this.expansion = expansion;
  }
}

function factionToString() {
  return `${dispatcher.getEmote(this.emote)} ${this.name}`;
}
Faction.prototype.toString = factionToString;

const allFactions = [
  new Faction("arborec", "basic"),
  new Faction("barony", "basic"),
  new Faction("saar", "basic"),
  new Faction("muaat", "basic"),
  new Faction("hacan", "basic"),
  new Faction("sol", "basic"),
  new Faction("ghost", "basic"),
  new Faction("lizix", "basic"),
  new Faction("mentak", "basic"),
  new Faction("naalu", "basic"),
  new Faction("nekro", "basic"),
  new Faction("sardakk", "basic"),
  new Faction("jolnar", "basic"),
  new Faction("winnu", "basic"),
  new Faction("xxcha", "basic"),
  new Faction("yin", "basic"),
  new Faction("yssaril", "basic"),
  new Faction("argent", "pok"),
  new Faction("empyrean", "pok"),
  new Faction("mahact", "pok"),
  new Faction("nra", "pok"),
  new Faction("nomad", "pok"),
  new Faction("titans", "pok"),
  new Faction("cabal", "pok"),
  new Faction("keleres", "pok")
]

function getAllFactions() {
  return allFactions.map(x=>x);
}

function getFactionsFromExpansion(expansion) {
  var result = new Array();
  for (var i = 0, len = allFactions.length; i < len; i++) {
    if(allFactions[i].expansion == expansion){
      result.push(allFactions[i]);
    }
  }
  return result;
}

function getFaction(name) {
  for (var i = 0, len = allFactions.length; i < len; i++) {
    if(allFactions[i].name == name){
      return allFactions[i];
    }
  }
  return null;
}

module.exports.getAllFactions = getAllFactions;
module.exports.getFactionsFromExpansion = getFactionsFromExpansion;
module.exports.getFaction = getFaction;
