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
    })
  })
})