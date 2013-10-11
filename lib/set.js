//am going to slowly delete this module

module.exports = Set

function Set(values) {
  this.values = values;
  this.length = this.values.length;
}

Set.prototype.copy = function() {
  return this.values.slice(0)
}

Set.prototype.enumerate = function(depth) {
  if (depth == null) depth = this.length
  var enumerationsLength = Math.pow(this.length, depth);
  var enumerations = [];
  
  for (var e = 0; e < enumerationsLength; ++e) {
    var digits = []
    for (var i = 0; i < depth; ++i) {
      var d = e % this.length;
      e -= d;
      e /= this.length;
      digits.push(this.values[d]); 
    }
    enumerations.push(new Set(digits));
  }

  return new Set(enumerations)
}

Set.prototype.reduce = function(iterator) {
  return this.values.reduce(iterator);
}

Set.prototype.sum = function() {
  if (this._sum) return _sum
  this._sum = this.reduce(function(a, b) { return a + b })
  return this._sum
}

Set.prototype.get = function(index, defaultVal) {
  if (this.values[index] == null) return defaultVal
  return this.values[index]
}

Set.prototype.each = function(iterator) {
  return this.values.map(iterator)
}

Set.prototype.map = function(iterator) {
  return new Set(this.each(iterator))
}

Set.prototype.pop = function(index) {
  return this.values.pop()
  this.length -= 1 //<--- this is not in the original code, but it should
}




