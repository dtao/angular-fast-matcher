var app = angular.module('FastMatcherDemo', ['fastMatcher']);

app.controller('DemoController', function($scope, $http, $q) {

  // Tab navigation
  $scope.currentPage = 'demo';

  $scope.getTabClass = function(page) {
    return $scope.isCurrentPage(page) ? 'active' : '';
  };

  $scope.showPage = function(page) {
    $scope.currentPage = page;
  };

  $scope.isCurrentPage = function(page) {
    return page === $scope.currentPage;
  };

  // Demo section
  $scope.words = [];
  $scope.loaded = false;

  var requests = [];
  angular.forEach('abcdefghijklmnopqrstuvwxyz'.split(''), function(chapter) {
    var request = $http.get('data/' + chapter + '.json');
    request.success(function(data) {
      $scope.words.push.apply($scope.words, data);
    });
    requests.push(request);
  });

  $scope.wordsPromise = $q.all(requests).then(function() {
    $scope.loaded = true;
    return $scope.words;
  });

});

app.directive('htmlSource', function() {
  return {
    link: function(scope, element, attrs) {
      var editor = CodeMirror.fromTextArea(element[0], {
        lineNumbers: true,
        mode: 'htmlmixed',
        readOnly: true
      });

      editor.execCommand('selectAll');
      editor.execCommand('indentAuto');
      editor.execCommand('goDocStart');
    }
  };
});
