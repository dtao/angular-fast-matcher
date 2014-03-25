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
