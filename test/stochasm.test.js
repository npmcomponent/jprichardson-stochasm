var should = require('should')
  , stochasm = require('../lib/stochasm')
  , u = require('./util')
  , _ = require('lodash')
  , cs = require('chi-square')

var SAMPLE_SIZE = 1000//00
var ERR = 0.1

describe('+ stochasm', function() {
  describe('> when no parameters', function() {
    it('should create a function that generates values between 0.0 and 1.0', function() {
      var generator = stochasm()
      var vals = []
      for (var i = 0; i < SAMPLE_SIZE; ++i) {
        vals.push(generator.next())
      }

      u.mean(vals).should.be.approximately(0.5, ERR)
      _(vals).min().should.be.approximately(0, ERR)
      _(vals).max().should.be.approximately(1, ERR)

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

      u.mean(vals).should.be.approximately(Math.PI / 2, ERR)
      _(vals).min().should.be.approximately(-Math.PI, ERR)
      _(vals).max().should.be.approximately(2 * Math.PI, ERR)
    })
  })
})