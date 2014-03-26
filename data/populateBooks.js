var fs      = require('fs'),
    http    = require('http'),
    async   = require('async'),
    cheerio = require('cheerio');

function loadTitles(letter, callback) {
  var books = [];

  var request = http.get('http://www.gutenberg.org/browse/titles/' + letter, function(response) {
    var html = '';
    response.on('data', function(data) {
      html += data;
    });

    response.on('end', function() {
      var $ = cheerio.load(html);

      $('.pgdbbytitle h2 a').each(function() {
        var el = $(this),
            title = el.text(),
            titleBase = getTitleBase(title),
            id = el.attr('href').split('/').pop(),
            authorEl = el.closest('h2').next('p').find('a'),
            author = authorEl.text(),
            authorFullName = getFullName(author),
            authorId = authorEl.attr('href').split('/').pop();

        books.push({
          id: id,
          title: title,
          titleBase: titleBase,
          author: author,
          authorFullName: authorFullName,
          authorId: authorId
        });
      });

      fs.writeFile('books/' + letter + '.json', JSON.stringify(books, null, 2), 'utf8', function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log('Wrote data file for ' + letter.toUpperCase() + '.');
        }

        callback();
      });
    });
  });

  request.on('error', function(err) {
    console.error(err);
    return callback();
  });
}

var TITLE_BASE_PATTERN = /^(?:a|an|the)\s+/i;

function getTitleBase(title) {
  if (TITLE_BASE_PATTERN.test(title)) {
    title = title.replace(TITLE_BASE_PATTERN, '');
  }
  return title;
}

function getFullName(name) {
  var parts = name.split(/,\s*/);
  if (parts.length > 1) {
    parts.push(parts.shift());
  }
  return parts.join(' ');
}

async.each('abcdefghijklmnopqrstuvwxyz'.split(''), loadTitles, function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Finished!');
});
