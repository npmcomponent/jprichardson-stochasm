var Set = require('./set')

module.exports = function(params) {
  if (arguments.length <= 1)
    return new Stochator(params)
  else if (arguments.length === 2)
    return new Stochator(params, arguments[1])
  else if (arguments.length === 3) //refactor to support any amount
    return new Stochator(arguments[0], arguments[1], arguments[2])
}

  var Stochator, callFunctions, floatGenerator, integerGenerator, inverseNormalCumulativeDistribution, isType, randomBoundedFloat, randomBoundedInteger, randomCharacter, randomColor, randomNormallyDistributedFloat, randomSetMember, randomSetMemberWithoutReplacement, randomWeightedSetMember, setGenerator, shuffleSet,
    __slice = [].slice;

  isType = function(type) {
    return function(arg) {
      return Object.prototype.toString.call(arg) === ("[object " + type + "]");
    };
  };

  callFunctions = function(fns) {
    var fn, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = fns.length; _i < _len; _i++) {
      fn = fns[_i];
      _results.push(fn());
    }
    return _results;
  };

  randomBoundedFloat = function(min, max) {
    var spread;
    if (min == null) {
      min = 0;
    }
    if (max == null) {
      max = 1;
    }
    spread = max - min;
    return Math.random() * spread + min;
  };

  randomBoundedInteger = function(min, max) {
    var spread;
    if (min == null) {
      min = 0;
    }
    if (max == null) {
      max = 1;
    }
    spread = 1 + max - min;
    return Math.floor(Math.random() * spread) + min;
  };

  randomNormallyDistributedFloat = function(mean, stdev, min, max) {
    var float, seed;
    seed = randomBoundedFloat();
    float = inverseNormalCumulativeDistribution(seed) * stdev + mean;
    if ((min != null) && (max != null)) {
      return Math.min(max, Math.max(min, float));
    } else {
      return float;
    }
  };

  randomSetMember = function(set) {
    var max;
    max = set.length - 1;
    return set.get(randomBoundedInteger(0, max));
  };

  randomSetMemberWithoutReplacement = function(set) {
    if (!set.get(0)) {
      return void 0;
    }
    set.length -= 1;
    return set.pop(randomBoundedInteger(0, set.length));
  };

  randomWeightedSetMember = function(set, weights) {
    var float, member, weightSum, _ref;
    _ref = [void 0, 0, randomBoundedFloat()], member = _ref[0], weightSum = _ref[1], float = _ref[2];
    set.each(function(value, index) {
      var weight;
      if (member) {
        return;
      }
      weight = weights.get(index);
      if (float <= weightSum + weight && float >= weightSum) {
        member = value;
      }
      return weightSum += weight;
    });
    return member;
  };

  inverseNormalCumulativeDistribution = function(probability) {
    var base, coefficient, denomCoeffcients, denomMaxExponent, denominator, high, low, mapMaxExp, numCoefficients, numMaxExponent, numerator, _ref, _ref1;
    high = probability > 0.97575;
    low = probability < 0.02425;
    if (low || high) {
      numCoefficients = new Set([-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968]);
      denomCoeffcients = new Set([7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]);
      _ref = [5, 4], numMaxExponent = _ref[0], denomMaxExponent = _ref[1];
      coefficient = low ? 1 : -1;
      base = Math.sqrt(-2 * Math.log(low ? probability : 1 - probability));
    } else {
      numCoefficients = new Set([-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239]);
      denomCoeffcients = new Set([-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]);
      _ref1 = [5, 5], numMaxExponent = _ref1[0], denomMaxExponent = _ref1[1];
      coefficient = probability - 0.5;
      base = Math.pow(coefficient, 2);
    }
    mapMaxExp = function(maxExp) {
      return function(value, index) {
        return value * Math.pow(base, maxExp - index);
      };
    };
    numerator = numCoefficients.map(mapMaxExp(numMaxExponent)).sum();
    denominator = denomCoeffcients.map(mapMaxExp(denomMaxExponent)).sum() + 1;
    return coefficient * numerator / denominator;
  };

  shuffleSet = function(set) {
    var index, randomIndex, tmp, values, _i, _ref;
    values = set.copy();
    for (index = _i = _ref = values.length - 1; _ref <= 0 ? _i < 0 : _i > 0; index = _ref <= 0 ? ++_i : --_i) {
      randomIndex = randomBoundedInteger(0, index);
      tmp = values[index];
      values[index] = values[randomIndex];
      values[randomIndex] = tmp;
    }
    return values;
  };

  floatGenerator = function(min, max, mean, stdev) {
    if (mean && stdev) {
      return function() {
        return randomNormallyDistributedFloat(mean, stdev, min, max);
      };
    } else {
      return function() {
        return randomBoundedFloat(min, max);
      };
    }
  };

  integerGenerator = function(min, max) {
    if (min == null) {
      min = 0;
    }
    if (max == null) {
      max = 1;
    }
    return function() {
      return randomBoundedInteger(min, max);
    };
  };

  setGenerator = function(values, replacement, shuffle, weights) {
    var set, weightsSet;
    if (replacement == null) {
      replacement = true;
    }
    if (shuffle == null) {
      shuffle = false;
    }
    if (weights == null) {
      weights = null;
    }
    if (!values || !values.length) {
      throw Error("Must provide a 'values' array for a set generator.");
    }
    set = new Set(values);
    if (shuffle) {
      return function() {
        return shuffleSet(set);
      };
    } else if (replacement) {
      if (weights) {
        weightsSet = new Set(weights);
        return function() {
          return randomWeightedSetMember(set, weightsSet);
        };
      } else {
        return function() {
          return randomSetMember(set);
        };
      }
    } else {
      return function() {
        return randomSetMemberWithoutReplacement(set);
      };
    }
  };

  Stochator = (function() {
    var VERSION;

    VERSION = "0.3.1";

    function Stochator() {
      var configs;
      configs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.setGenerator(configs);
    }

    Stochator.prototype.createGenerator = function(config) {
      var generator, max, mean, min, replacement, shuffle, stdev, values, weights, _ref;
      if ((_ref = config.kind) == null) {
        config.kind = "float";
      }
      generator = (function() {
        switch (config.kind) {
          case "float":
            min = config.min, max = config.max, mean = config.mean, stdev = config.stdev;
            return floatGenerator(min, max, mean, stdev);
          case "integer":
            return integerGenerator(config.min, config.max);
          case "set":
            values = config.values, replacement = config.replacement, shuffle = config.shuffle, weights = config.weights;
            return setGenerator(values, replacement, shuffle, weights);
        }
      })();
      if (!generator) {
        throw Error("" + config.kind + " not a recognized kind.");
      } else {
        return generator;
      }
    };

    Stochator.prototype.createGenerators = function(configs, mutator) {
      var callGenerators, caller, config, generators, _ref,
        _this = this;
      if ((_ref = configs[0]) == null) {
        configs[0] = {};
      }
      generators = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = configs.length; _i < _len; _i++) {
          config = configs[_i];
          _results.push(this.createGenerator(config));
        }
        return _results;
      }).call(this);
      if (!mutator) {
        callGenerators = generators.length === 1 ? function() {
          return callFunctions(generators)[0];
        } : function() {
          return callFunctions(generators);
        };
      } else {
        caller = generators.length === 1 ? function() {
          return callFunctions(generators)[0];
        } : function() {
          return callFunctions(generators);
        };
        callGenerators = function() {
          return _this.value = mutator.call(_this, caller(), _this.value);
        };
      }
      return function(times) {
        var time, _i, _results;
        if (times) {
          _results = [];
          for (time = _i = 1; 1 <= times ? _i <= times : _i >= times; time = 1 <= times ? ++_i : --_i) {
            _results.push(callGenerators());
          }
          return _results;
        } else {
          return callGenerators();
        }
      };
    };

    Stochator.prototype.setGenerator = function(configs) {
      var config, generatorConfigs, mutator, name, _i, _len, _ref, _ref1;
      generatorConfigs = [];
      for (_i = 0, _len = configs.length; _i < _len; _i++) {
        config = configs[_i];
        if (isType("Object")(config)) {
          generatorConfigs.push(config);
        } else {
          break;
        }
      }
      _ref = configs.slice(generatorConfigs.length), name = _ref[0], mutator = _ref[1];
      name || (name = "next");
      if (isType("Function")(name)) {
        _ref1 = ["next", name], name = _ref1[0], mutator = _ref1[1];
      }
      return this[name] = this.createGenerators(generatorConfigs, mutator);
    };

    Stochator.prototype.toString = function() {
      return "[object Stochator]";
    };

    return Stochator;

  })();




