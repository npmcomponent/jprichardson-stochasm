

  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };



    function Set(values) {
      this.values = values;
      this.length = this.values.length;
    }

    Set.prototype.toString = function() {
      return "[object Set]";
    };

    Set.prototype.copy = function() {
      return this.values.slice(0, this.length);
    };

    Set.prototype.enumerate = function(depth) {
      var d, digits, e, enumeration, enumerations, enumerationsLength, i, _i, _j;
      if (depth == null) {
        depth = this.length;
      }
      enumerationsLength = Math.pow(this.length, depth);
      enumerations = [];
      for (enumeration = _i = 0; 0 <= enumerationsLength ? _i < enumerationsLength : _i > enumerationsLength; enumeration = 0 <= enumerationsLength ? ++_i : --_i) {
        e = enumeration;
        digits = [];
        for (i = _j = 0; 0 <= depth ? _j < depth : _j > depth; i = 0 <= depth ? ++_j : --_j) {
          d = e % this.length;
          e -= d;
          e /= this.length;
          digits.push(this.values[d]);
        }
        enumerations.push(new Set(digits));
      }
      return new Set(enumerations);
    };

    Set.prototype.intersection = function(set) {
      var value;
      return new Set((function() {
        var _i, _len, _ref, _results;
        _ref = set.values;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          value = _ref[_i];
          if (__indexOf.call(this.values, value) >= 0) {
            _results.push(value);
          }
        }
        return _results;
      }).call(this));
    };

    Set.prototype.union = function(set) {
      return new Set(this.values.concat(this.difference(set).values));
    };

    Set.prototype.difference = function(set) {
      var value;
      return new Set((function() {
        var _i, _len, _ref, _results;
        _ref = set.values;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          value = _ref[_i];
          if (!(__indexOf.call(this.values, value) >= 0)) {
            _results.push(value);
          }
        }
        return _results;
      }).call(this));
    };

    Set.prototype.symmetricDifference = function(set) {
      return this.union(set).difference(this.intersection(set));
    };

    Set.prototype.reduce = function(iterator) {
      return this.values.reduce(iterator);
    };

    Set.prototype.reverse = function() {
      return new Set(this.copy().reverse());
    };

    Set.prototype.sort = function(compare) {
      return this.copy().sort(compare);
    };

    Set.prototype.sum = function() {
      var _ref;
      return (_ref = this._sum) != null ? _ref : this._sum = this.reduce(function(a, b) {
        return a + b;
      });
    };

    Set.prototype.mean = function() {
      var _ref;
      return (_ref = this._mean) != null ? _ref : this._mean = this.sum() / this.length;
    };

    Set.prototype.stdev = function() {
      var value, _ref;
      return (_ref = this._stdev) != null ? _ref : this._stdev = Math.sqrt(new Set((function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.values;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          value = _ref1[_i];
          _results.push(Math.pow(value - this.mean(), 2));
        }
        return _results;
      }).call(this)).mean());
    };

    Set.prototype.get = function(index, dflt) {
      if (this.values[index] != null) {
        return this.values[index];
      } else {
        return dflt;
      }
    };

    Set.prototype.each = function(iterator) {
      var index, value, _i, _len, _ref, _results;
      _ref = this.values;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        value = _ref[index];
        _results.push(iterator(value, index));
      }
      return _results;
    };

    Set.prototype.map = function(iterator) {
      var index, value;
      return new Set((function() {
        var _i, _len, _ref, _results;
        _ref = this.values;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          value = _ref[index];
          _results.push(iterator(value, index));
        }
        return _results;
      }).call(this));
    };

    Set.prototype.pop = function(index) {
      var value;
      if (index == null) {
        index = this.length - 1;
      }
      value = this.values[index];
      this.values.splice(index, 1);
      return value;
    };

module.exports = Set


