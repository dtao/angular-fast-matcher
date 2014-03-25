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
            makeSelection = scope.selectionCallback,
            model = attrs.ngModel;

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
            matches: scope.matches
          });

          parentScope.$watch(model, function() {
            var needle = parentScope[model];

            scope.matches.length = 0;
            setCurrentIndex(-1);

            if (needle) {
              matcher.getMatches(needle);
            }
          });

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

                case 27: // esc
                  element.blur();
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
