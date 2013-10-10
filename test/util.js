var me = module.exports

me.mean = function(vals) {
  return vals.reduce(function(acc, cur) { return acc + cur },0) / vals.length
}

me.stdev = function (vals) {
  var mean = me.mean(vals)
  var sumSq = vals.reduce(function(acc, cur) { return acc + Math.pow(cur - mean, 2)},0)
  return Math.sqrt(sumSq / (vals.length - 1))
}