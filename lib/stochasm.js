

module.exports = function(params) {
  if (arguments.length <= 1)
    return new Stochator(params)
  else if (arguments.length === 2)
    return new Stochator(params, arguments[1])
  else if (arguments.length === 3) //refactor to support any amount
    return new Stochator(arguments[0], arguments[1], arguments[2])
}

function callFunctions(fns) {
  return fns.map(function(fn) { return fn() })
}

function randomBoundedFloat (min, max) {
  if (min == null) min = 0
  if (max == null) max = 1
  var spread = max - min
  return Math.random() * spread + min
}

function randomBoundedInteger (min, max) {
  if (min == null) min = 0
  if (max == null) max = 1
  var spread = 1 + max - min
  return Math.floor(Math.random() * spread) + min
}

function randomNormallyDistributedFloat (mean, stdev, min, max) {
  var seed = randomBoundedFloat()
  var float = inverseNormalCumulativeDistribution(seed) * stdev + mean
    
  if ((min != null) && (max != null))
    return Math.min(max, Math.max(min, float))
  else 
    return float
}

function randomSetMember(vals) {
  var max = vals.length - 1
  return vals[(randomBoundedInteger(0, max))]
}

function randomSetMemberWithoutReplacement (vals) {
  if (vals[0] == null) return void 0
  return vals.splice(randomBoundedInteger(0, vals.length),1)
}

function randomWeightedSetMember (vals, weights) {
  var member = undefined
  var weightSum = 0
  var float = randomBoundedFloat()

  vals.forEach(function(value, index) {
    if (member) return
    var weight = weights[index]
    if (float <= weightSum + weight && float >= weightSum)
      member = value
      
    return weightSum += weight
  })
  return member
}

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
  if (mean && stdev) 
    return function() { return randomNormallyDistributedFloat(mean, stdev, min, max) }
  else 
    return function() { return randomBoundedFloat(min, max) } 
}

function integerGenerator (min, max) {
  if (min == null) min = 0
  if (max == null) max = 1    
  return function() { return randomBoundedInteger(min, max) }
}

function setGenerator(values, replacement, weights) {
  if (replacement == null) replacement = true
  if (weights == null) weights = null
  if (!values || !values.length) throw Error("Must provide a 'values' array for a set generator.")
    
  if (replacement) {
    if (weights) 
      return function() { return randomWeightedSetMember(values, weights) }
    else 
      return function() { return randomSetMember(values) }
  } else {
    return function() { return randomSetMemberWithoutReplacement(values) }
  }
}

function Stochator() {
  this.setGenerator([].slice.call(arguments))
}

Stochator.prototype.createGenerator = function(cfg) {
  cfg.kind = cfg.kind || "float"
  
  switch (cfg.kind) {
    case "float":
      return floatGenerator(cfg.min, cfg.max, cfg.mean, cfg.stdev)
    case "integer":
      return integerGenerator(cfg.min, cfg.max)
    case "set":
      return setGenerator(cfg.values, cfg.replacement, cfg.weights)
  }
}

Stochator.prototype.createGenerators = function(configs, mutator) {
  var _this = this
  configs[0] = configs[0] || {}
  var generators = configs.map(function(cfg) { return _this.createGenerator(cfg) })

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

  return function(times) {
    if (!times) return callGenerators()

    var results = []
    for (var i = 1; i <= times; ++i)
      results.push(callGenerators())
    return results
  }
}

Stochator.prototype.setGenerator = function(configs) {
  var generatorConfigs = configs.filter(function(c) {
    return typeof c === 'object'
  })

  //mutator always last param
  var mutator = configs.slice(generatorConfigs.length)[0]
  return this.next = this.createGenerators(generatorConfigs, mutator)
}








