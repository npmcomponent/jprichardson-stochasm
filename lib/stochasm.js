
;(function(globals){

//UMD
if (typeof define !== 'undefined' && define.amd) { //require.js / AMD
  define([], function() {
    return stochasm
  })
} else if (typeof module !== 'undefined' && module.exports) { //CommonJS
  module.exports = stochasm
} else { //script / browser
  globals.stochasm = stochasm
}


function stochasm() {
  var configs = [].slice.call(arguments)

  var generatorConfigs = configs.filter(function(c) {
    return typeof c === 'object'
  })

  var generator = {value: null} //value = initial value, rarely necessary
  generator.rand = Math.random //bring your own random function to the party if you want

  //mutator always last param
  var mutator = configs.slice(generatorConfigs.length)[0]
  generator.next = createGenerators.call(generator, generatorConfigs, mutator)
  return generator
}

function callFunctions(fns) {
  return fns.map(function(fn) { return fn() })
}

function randomBoundedFloat (min, max) {
  if (min == null) min = 0
  if (max == null) max = 1
  var spread = max - min
  return this.rand() * spread + min
}

function randomBoundedInteger (min, max) {
  if (min == null) min = 0
  if (max == null) max = 1
  var spread = 1 + max - min
  return Math.floor(this.rand() * spread) + min
}

function randomNormallyDistributedFloat (mean, stdev, min, max) {
  var seed = randomBoundedFloat.call(this)
  var float = inverseNormalCumulativeDistribution(seed) * stdev + mean
    
  if ((min != null) && (max != null))
    return Math.min(max, Math.max(min, float))
  else 
    return float
}

function randomSetMember(vals) {
  var that = this
  var max = vals.length - 1
  return vals[randomBoundedInteger.call(that, 0, max)]
}

function randomSetMemberWithoutReplacement (vals) {
  var that = this
  if (vals[0] == null) return void 0
  return vals.splice(randomBoundedInteger.call(that, 0, vals.length),1)
}

function randomWeightedSetMember (vals, weights) {
  var member = undefined
  var weightSum = 0
  var float = randomBoundedFloat.call(this)

  vals.forEach(function(value, index) {
    if (member) return
    var weight = weights[index]
    if (float <= weightSum + weight && float >= weightSum)
      member = value
      
    return weightSum += weight
  })
  return member
}

//http://home.online.no/~pjacklam/notes/invnorm/
function inverseNormalCumulativeDistribution(probability) {
  var high = probability > 0.97575, low = probability < 0.02425

  if (low || high) {
    var numCoefficients = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968]
    var denomCoeffcients = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
    var numMaxExponent = 5, denomMaxExponent = 4
    var coefficient = low ? 1 : -1
    var base = Math.sqrt(-2 * Math.log(low ? probability : 1 - probability))
  } else {
    var numCoefficients = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239]
    var denomCoeffcients = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
    var numMaxExponent = 5, denomMaxExponent = 5
    var coefficient = probability - 0.5
    var base = Math.pow(coefficient, 2)
  }
    
  function mapMaxExp(maxExp) {
    return function(value, index) {
      return value * Math.pow(base, maxExp - index);
    }
  }
    
  var numerator = numCoefficients.map(mapMaxExp(numMaxExponent)).reduce(function(a,b) { return a + b}) //compute sum
  var denominator = denomCoeffcients.map(mapMaxExp(denomMaxExponent)).reduce(function(a,b) { return a + b}) + 1
  return coefficient * numerator / denominator;
}

function floatGenerator(min, max, mean, stdev) {
  var that = this
  if (mean && stdev) 
    return function() { return randomNormallyDistributedFloat.call(that, mean, stdev, min, max) }
  else 
    return function() { return randomBoundedFloat.call(that, min, max) } 
}

function integerGenerator (min, max) {
  var that = this
  if (min == null) min = 0
  if (max == null) max = 1    
  return function() { return randomBoundedInteger.call(that, min, max) }
}

function setGenerator(values, replacement, weights) {
  var that = this

  if (replacement == null) replacement = true
  if (weights == null) weights = null
  if (!values || !values.length) throw Error("Must provide a 'values' array for a set generator.")
    
  if (replacement) {
    if (weights) 
      return function() { return randomWeightedSetMember.call(that, values, weights) }
    else 
      return function() { return randomSetMember.call(that, values) }
  } else {
    return function() { return randomSetMemberWithoutReplacement.call(that, values) }
  }
}

function createGenerator(cfg) {
  cfg.kind = cfg.kind || "float"
  switch (cfg.kind) {
    case "float":
      return floatGenerator.call(this, cfg.min, cfg.max, cfg.mean, cfg.stdev)
    case "integer":
      return integerGenerator.call(this, cfg.min, cfg.max)
    case "set":
      return setGenerator.call(this, cfg.values, cfg.replacement, cfg.weights)
  }
}

function createGenerators (configs, mutator) {
  var _this = this
  configs[0] = configs[0] || {}
  var generators = configs.map(function(cfg) { return createGenerator.call(_this, cfg) })

  if (!mutator) {
    if (generators.length === 1)
      var callGenerators = function() { return callFunctions(generators)[0] }
    else
      var callGenerators = function() { return callFunctions(generators) }
  } else {
    if (generators.length === 1)
      var caller = function() { return callFunctions(generators)[0] }
    else
      var caller = function() { return callFunctions(generators) }

    var callGenerators = function() {
      return _this.value = mutator.call(_this, caller(), _this.value);
    }
  }

  return function(times) { //next(5)
    if (!times) return callGenerators()

    var results = []
    for (var i = 1; i <= times; ++i)
      results.push(callGenerators())
    return results
  }
}


})(this);







