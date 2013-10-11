randomColor = function() {
  var byte, mutator;
  byte = {
    kind: "integer",
    min: 0,
    max: 255
  };
  mutator = function(bytes) {
    var blue, green, red;
    red = bytes[0], green = bytes[1], blue = bytes[2];
    return {
      red: red,
      green: green,
      blue: blue
    };
  };
  return new Stochator(byte, byte, byte, mutator).next;
};

randomCharacter = function(lowercase) {
  var max, min, mutator, _ref;
  _ref = lowercase ? [97, 122] : [65, 90], min = _ref[0], max = _ref[1];
  mutator = function(charCode) {
    return String.fromCharCode(charCode);
  };
  return new Stochator({
    kind: "integer",
    min: min,
    max: max
  }, mutator).next;
};

/*

var chores = new Stochator({
    kind: "set",
    values: ["floors", "windows", "dishes"],
    replacement: false
});
var myChore = chores.next(); // "windows"
var yourChore = chores.next(); // "floors"
var hisChore = chores.next(); // "dishes"
var noOnesChore = chores.next(); // undefined


*/