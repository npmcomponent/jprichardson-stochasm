var should = require('should')
  , stochasm = require('../lib/stochasm')
  , u = require('./util')
  , _ = require('lodash')
  , cs = require('chi-square')

var SAMPLE_SIZE = 10000//00

describe('+ stochasm', function() {
  describe('> when no parameters', function() {
    it('should create a function that generates values between 0.0 and 1.0', function() {
      var generator = stochasm()
      var vals = []
      for (var i = 0; i < SAMPLE_SIZE; ++i) {
        vals.push(generator.next())
      }

      u.mean(vals).should.be.approximately(0.5, 0.1)
      _(vals).min().should.be.approximately(0, 0.1)
      _(vals).max().should.be.approximately(1, 0.1)

      var newVals = generator.next(SAMPLE_SIZE)
      newVals.length.should.eql(SAMPLE_SIZE)
    })
  })

  describe('> when min/max interval parameters are passed', function() {
    it('should create a function that generates values between the min and max', function() {
      var generator = stochasm({min: -Math.PI, max: 2 * Math.PI})
      var vals = []
      for (var i = 0; i < SAMPLE_SIZE; ++i) {
        vals.push(generator.next())
      }

      u.mean(vals).should.be.approximately(Math.PI / 2, 0.1)
      _(vals).min().should.be.approximately(-Math.PI, 0.1)
      _(vals).max().should.be.approximately(2 * Math.PI, 0.1)
    })
  })

  describe('> when min, max, mean, and stddev parameters are passed', function() {
    it('should create a function that generates values governed by the normal distribuation', function() {
      var sd = 14
      var m = 75

      var generator = stochasm({mean: m, stdev: sd, min: 0, max: 100})
      var vals = []
      for (var i = 0; i < SAMPLE_SIZE; ++i) {
        vals.push(generator.next())
      }

      u.mean(vals).should.be.approximately(75, 1)
      u.stdev(vals).should.be.approximately(14, 1)
      _(vals).min().should.be.approximately(0, 2*sd)
      _(vals).max().should.be.approximately(100, 1)

    })
  })

  //will probably remove the ability to use "kinds" and to use custom named functions
  describe('> when the kind is an integer', function() {
    it('should create a function that generates bounded integers', function() {
      var generator = stochasm({kind: "integer", min: 1, max: 6}, 'roll')
      var vals = []
      for (var i = 0; i < SAMPLE_SIZE; ++i) {
        vals.push(generator.roll())
      }
 
      _.min(vals).should.equal(1) 
      _.max(vals).should.equal(6)

      //is it a fair die? hehehe
      var counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6:0}
      vals.forEach(function(n) {
        counts[n] += 1
      })

      Object.keys(counts).forEach(function(n) {
        var count = counts[n]
        count.should.be.approximately(SAMPLE_SIZE / 6, SAMPLE_SIZE*0.03)
      })
    })
  })

  describe('> when the kind is a set', function() {
    it('should create a function that generates set items', function() {
      var dayGenerator = stochasm({
        kind: "set",
        values: ["m", "t", "w", "r", "f", "sa", "su"]
      })
     
      var vals = []
      for (var i = 0; i < SAMPLE_SIZE; ++i) {
        vals.push(dayGenerator.next())
      }

      var counts = {'m': 0, 't': 0, 'w': 0, 'r': 0, 'f': 0, 'sa': 0, 'su': 0}
      vals.forEach(function(d) {
        counts[d] += 1
      })

      Object.keys(counts).forEach(function(d) {
        var count = counts[d]
        count.should.be.approximately(SAMPLE_SIZE / 7, SAMPLE_SIZE*0.03)
      })      
    })
  })

  describe('> when the kind is a set with weights', function() {
    it('should create a function that generates set items according to weight', function() {
      var dayGenerator = stochasm({
        kind: "set",
        values: ["m", "t", "w", "r", "f", "sa", "su"],
        weights: [0.1, 0.1, 0.1, 0.1, 0.1, 0.25, 0.25] //favor weekends
      })
      
      var vals = []
      for (var i = 0; i < SAMPLE_SIZE; ++i) {
        vals.push(dayGenerator.next())
      }

      var counts = {'m': 0, 't': 0, 'w': 0, 'r': 0, 'f': 0, 'sa': 0, 'su': 0}
      vals.forEach(function(d) {
        counts[d] += 1
      })

      Object.keys(counts).forEach(function(d) {
        if (d == 'sa' || d == 'su') return

        var count = counts[d]
        count.should.be.approximately(SAMPLE_SIZE*0.1, SAMPLE_SIZE*0.03)
      })

      counts['sa'].should.be.approximately(SAMPLE_SIZE*0.25, SAMPLE_SIZE*0.03)
      counts['su'].should.be.approximately(SAMPLE_SIZE*0.25, SAMPLE_SIZE*0.03)
    })
  })

  describe('> when a mutator function is specified', function() {
    it('should create a function that generates values according to the mutator', function() {
      function mutate (val) {
        return val >= 0 ? '+' : '-' //slight bias towards positive because ">= 0"
      }

      var pnGen = stochasm({kind: 'float', min: -1.0, max: 1.0}, mutate)
      var vals = pnGen.next(SAMPLE_SIZE)

      var counts = {'-': 0, '+': 0}
      vals.forEach(function(v) { counts[v] += 1 })

      Object.keys(counts).forEach(function(v) {
        var count = counts[v]
        count.should.be.approximately(SAMPLE_SIZE / 2, SAMPLE_SIZE*0.03)
      }) 
    })
  })

  describe('> when a mutator function is specified with an initial value', function() {
    it('should create a function that generates values according to the mutator and initial value', function() {
      var min = 1.01
      var max = 1.05
      var initVal = 1000
      var annualSavings = 250

      //models a bank account: how much money after 10 years if you add 250 a month, have a random interest rate from 1% to 5%
      function addInterest(interestRate, principal) {
        return (principal + annualSavings) * interestRate
      }

      var savingsAccount = stochasm({kind: 'float', min: min, max: max}, addInterest)
      savingsAccount.value = initVal
      
      var amounts = savingsAccount.next(10) //amounts for 10 years
      for (var i = 0; i < amounts.length; ++i) {
        var err = Math.pow(1 + (max - min)/2, 1+i)
        var x = (initVal + (i+1)*annualSavings) * err
        //console.log("real %d should be close to estimate %d", amounts[i], x)
        amounts[i].should.be.approximately(x, annualSavings*err*1.03)
      }
    })
  })

  describe('> when multiple generators are are input', function() {
    it('should create a function that generates multiple values governed by the configuration', function() {
      var x = { kind: 'integer', min: 0, max: 1400 };
      var y = { kind: 'integer', min: 0, max: 900 };
      var mutator = function(values) {
        return {
          x: values[0],
          y: values[1]
        }
      }

      var randomPoint = stochasm(x, y, mutator)
      var pts = randomPoint.next(SAMPLE_SIZE)

      _.min(pts, function(pt) { return pt.x }).x.should.be.approximately(0, 10)
      _.min(pts, function(pt) { return pt.y }).y.should.be.approximately(0, 10)
      _.max(pts, function(pt) { return pt.x }).x.should.be.approximately(1400, 10)
      _.max(pts, function(pt) { return pt.y }).y.should.be.approximately(900, 10)
    })
  })
})


