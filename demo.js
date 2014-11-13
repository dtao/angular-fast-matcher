var app = angular.module('FastMatcherDemo', ['fastMatcher']);

// Prevent links w/ ng-click attributes from changing the address bar.

window.addEventListener('load', function() {
  document.body.addEventListener('click', function(e) {
    var target = e.target;

    if (!target) {
      return;
    }

    if (target.nodeName === 'A' && !!target.getAttribute('ng-click')) {
      e.preventDefault();
    }
  });
});

app.controller('DemoController', function($scope, $window, $http, $q, $filter) {

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
  $scope.books = [];
  $scope.loaded = false;

  Object.defineProperty($scope, 'inputPlaceholder', {
    get: function() {
      var message = 'Search ' + $filter('number')($scope.books.length) +
        ' books from Project Gutenberg';

      if (!$scope.loaded) {
        message += ' (still loading...)';
      }

      return message;
    }
  });

  var requests = [];
  angular.forEach('abcdefghijklmnopqrstuvwxyz'.split(''), function(letter) {
    var request = $http.get('data/books/' + letter + '.json');
    request.success(function(data) {
      $scope.books.push.apply($scope.books, data);
    });
    requests.push(request);
  });

  $scope.booksPromise = $q.all(requests).then(function() {
    $scope.loaded = true;
    return $scope.books;
  });

  $scope.currentBookIndex = -1;

  $scope.setCurrentBook = function(index) {
    $scope.currentBookIndex = index;
  };

  $scope.selectBook = function(book) {
    $window.open('http://www.gutenberg.org/ebooks/' + book.id);
  };

});
