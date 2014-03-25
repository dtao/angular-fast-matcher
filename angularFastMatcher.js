(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

  /**
   * @example
   * var list = ['b', 'a', 'c'];
   *
   * // constructing a FastMatcher instance should not modify the list passed in
   * new FastMatcher(list); // list == ['b', 'a', 'c']
   */
  function FastMatcher(list, options) {
    this.list     = list.slice(0);
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
    var baseSelector = this.getBaseSelector(this.options.selector);

    return this.options.caseInsensitive ?
      function(x) { return baseSelector(x).toLowerCase(); } :
      baseSelector;
  };

  FastMatcher.prototype.getBaseSelector = function(selector) {
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
   * function getMatches(list, prefix, options) {
   *   return new FastMatcher(list, options).getMatches(prefix);
   * }
   *
   * getMatches(['aa', 'ab', 'ba', 'bb'], 'a');
   * // => ['aa', 'ab']
   *
   * getMatches(['aa', 'ba', 'AB', 'BB'], 'a', { caseInsensitive: true });
   * // => ['aa', 'AB']
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
   * startsWith('', 'a');     // => false
   * startsWith('a', 'a');    // => true
   * startsWith('aa', 'a');   // => true
   * startsWith('foo', 'f');  // => true
   * startsWith('bar', 'f');  // => false
   * startsWith('foo', 'fo'); // => true
   * startsWith('foo', 'o');  // => false
   */
  function startsWith(string, prefix) {
    return string.lastIndexOf(prefix, prefix.length - 1) === 0;
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
        matches: '=fastMatcherOutput',
        currentCallback: '=fastMatcherCurrentCallback',
        selectionCallback: '=fastMatcherSelectionCallback'
      },
      link: function(scope, element, attrs) {
        var parentScope = scope.$parent,
            property = attrs.fastMatcherProperty,
            makeSelection = scope.selectionCallback;

        if (!scope.matches) {
          scope.matches = [];
        }

        var selectedIndex = -1;
        function setCurrentIndex(index) {
          selectedIndex = index;
          if (scope.currentCallback) {
            scope.currentCallback(index);
          }
        }

        $q.when(scope.source).then(function(source) {
          var matcher = new FastMatcher(source, {
            selector: property,
            matches: scope.matches,
            caseInsensitive: true
          });

          var previousNeedle;
          function refreshMatches(needle) {
            if (needle !== previousNeedle) {
              scope.matches.length = 0;
              setCurrentIndex(-1);

              if (needle) {
                matcher.getMatches(needle);
              }
            }

            previousNeedle = needle;
          }

          if (attrs.ngModel) {
            parentScope.$watch(attrs.ngModel, function() {
              refreshMatches(parentScope[attrs.ngModel]);
            });

          } else {
            element.on('keyup', function() {
              scope.$apply(function() { refreshMatches(element.val()); });
            });
          }

          if (makeSelection) {
            element.on('keyup', function(e) {
              switch (e.keyCode) {
                case 13: // enter
                  if (selectedIndex >= 0 && selectedIndex < scope.matches.length) {
                    makeSelection(scope.matches[selectedIndex]);
                  } else if (scope.matches.length === 1) {
                    makeSelection(scope.matches[0]);
                  }
                  setCurrentIndex(-1);
                  break;

                case 38: // up
                  setCurrentIndex((selectedIndex || scope.matches.length) - 1);
                  break;

                case 40: // down
                  setCurrentIndex(++selectedIndex % scope.matches.length);
                  break;
              }

              scope.$apply();
            });
          }
        });
      }
    };
  }]);

}(angular));

},{"fast-matcher":1}]},{},[2])