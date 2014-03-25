(function(angular) {

  var FastMatcher = require('fast-matcher');

  var module = angular.module('fastMatcher', []);

  module.directive('fastMatcher', ['$q', function($q) {
    return {
      scope: {
        source: '=fastMatcherSource',
        matches: '=fastMatcherOutput',
        selector: '=fastMatcherSelector'
      },
      link: function(scope, element, attrs) {
        var parentScope = scope.$parent,
            property = attrs.fastMatcherProperty,
            selector = scope.selector,
            model = attrs.ngModel;

        if (!scope.matches) {
          scope.matches = [];
        }

        $q.when(scope.source).then(function(source) {
          var matcher = new FastMatcher(source, {
            selector: property,
            matches: scope.matches
          });

          parentScope.$watch(model, function() {
            var needle = parentScope[model];

            scope.matches.length = 0;
            parentScope.selectedIndex = -1;

            if (needle) {
              matcher.getMatches(needle);
            }
          });

          if (selector) {
            element.on('keyup', function(e) {
              switch (e.keyCode) {
                case 13: // enter
                  if (parentScope.selectedIndex >= 0 && parentScope.selectedIndex < scope.matches.length) {
                    selector(scope.matches[parentScope.selectedIndex]);
                  } else if (scope.matches.length === 1) {
                    selector(scope.matches[0]);
                  }
                  parentScope.selectedIndex = -1;
                  break;

                case 27: // esc
                  element.blur();
                  break;

                case 38: // up
                  parentScope.selectedIndex = (parentScope.selectedIndex || scope.matches.length) - 1;
                  break;

                case 40: // down
                  parentScope.selectedIndex = ++parentScope.selectedIndex % scope.matches.length;
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
