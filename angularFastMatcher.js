(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

  function FastMatcher(list, options) {
    this.list     = list;
    this.options  = options || {};
    this.matches  = this.options.matches || [];

    var selector = this.selector = this.createSelector();
    this.list.sort(function(x, y) {
      return compare(selector(x), selector(y));
    });
  }

  /**
   * @example
   * function createSelector(property) {
   *   return new FastMatcher([], { selector: property }).createSelector();
   * }
   *
   * createSelector()('foo');
   * // => 'foo'
   *
   * createSelector('x')({ x: 'bar'});
   * // => 'bar'
   *
   * createSelector(function(str) { return str.slice(1); })('foo');
   * // => 'oo'
   */
  FastMatcher.prototype.createSelector = function createSelector() {
    var selector = this.options.selector;

    if (typeof selector === 'function') {
      return selector;
    }

    if (selector) {
      return function(x) { return x[selector]; };
    }

    return function(x) { return x; };
  };

  /**
   * @example
   * var fm = new FastMatcher(['ab', 'ac', 'ba', 'bc']);
   *
   * fm.getMatches('a'); // => ['ab', 'ac']
   */
  FastMatcher.prototype.getMatches = function getMatches(prefix) {
    if (this.options.caseInsensitive) {
      prefix = prefix.toLowerCase();
    }

    var limit    = Number(this.options.limit || 25),
        selector = this.selector;

    var list    = this.list,
        matches = this.matches,
        index   = this.findIndex(prefix);

    matches.length = 0;

    var item;
    while (index < list.length) {
      if (matches.length === limit) {
        break;
      }

      item = selector(list[index]);
      if (this.options.caseInsensitive) {
        item = item.toLowerCase();
      }

      if (!startsWith(item, prefix)) {
        break;
      }

      matches.push(list[index++]);
    }

    return matches;
  };

  FastMatcher.prototype.findIndex = function findIndex(prefix) {
    var list     = this.list,
        selector = this.selector,
        lower    = 0,
        upper    = list.length;

    var i, value;
    while (lower < upper) {
      i = (lower + upper) >>> 1;

      value = selector(list[i]);
      if (this.options.caseInsensitive) {
        value = value.toLowerCase();
      }

      if (compare(value, prefix) === -1) {
        lower = i + 1;
      } else {
        upper = i;
      }
    }

    return lower;
  };

  /**
   * @private
   * @example
   * compare('foo', 'foo'); // => 0
   * compare('foo', 'bar'); // => 1
   * compare('bar', 'foo'); // => -1
   */
  function compare(x, y) {
    if (x == y) { return 0; }
    return x > y ? 1 : -1;
  }

  /**
   * @private
   * @example
   * startsWith('foo', 'f');  // => true
   * startsWith('bar', 'f');  // => false
   * startsWith('foo', 'fo'); // => true
   * startsWith('foo', 'o');  // => false
   */
  function startsWith(string, prefix) {
    return string.lastIndexOf(prefix, prefix.length) === 0;
  }

  if (typeof module === 'object' && (module && module.exports)) {
    module.exports = FastMatcher;
  }

  this.FastMatcher = FastMatcher;

}.call(this));

},{}],2:[function(require,module,exports){
(function(angular) {

  var FastMatcher = require('fast-matcher');

  var module = angular.module('fastMatcher', []);

  module.directive('fastMatcher', ['$q', function($q) {

    return {
      scope: {
        source: '=fastMatcherSource',
        matches: '=fastMatcherOutput'
      },
      link: function(scope, element, attrs) {
        var selector = attrs.fastMatcherProperty,
            needleSelector = attrs.ngModel;

        if (!scope.matches) {
          scope.matches = [];
        }

        $q.when(scope.source).then(function(source) {
          var matcher = new FastMatcher(source, {
            selector: selector,
            matches: scope.matches
          });

          scope.$parent.$watch(needleSelector, function() {
            var needle = scope.$parent[needleSelector];

            scope.matches.length = 0;

            if (needle) {
              matcher.getMatches(needle);
            }
          });
        });
      }
    };

  }]);

}(angular));

},{"fast-matcher":1}]},{},[2])