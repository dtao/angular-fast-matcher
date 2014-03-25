var app = angular.module('FastMatcherDemo', ['fastMatcher']);

app.controller('DemoController', function($scope, $window, $http, $q) {

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
