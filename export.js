var http = require('http');
var https = require('https');
var util = require('./util');
var read = require('read')
var url = require('url');
var fs = require('fs');

var settings = {
  tx_url: "https://www.transifex.com"
}

/**
 *
 */
function write(content) {
  console.log("Writing to file " + settings.filename);
  fs.writeFileSync(settings.filename, JSON.stringify(content, null, 2));
}

/**
 *
 */
function runOnTranslations(sourceContent, sourceXPaths, callback) {
  console.log(
    'Found ' + Object.keys(sourceContent).length + ' source strings and ' +
    Object.keys(sourceXPaths).length + ' xpaths'
  );
  util.runPhantomJs(settings.translationUrl, function(translationContent, translationXPaths) {
    console.log(
      'Found ' + Object.keys(translationContent).length + ' source strings and ' +
      Object.keys(translationXPaths).length + ' xpaths'
    );
    var result = {};
    for (var xpath in translationXPaths) {
      var key = sourceXPaths[xpath];
      if (key) {
        if (sourceContent[key] == translationContent[translationXPaths[xpath]]) {
          console.log('Translation and source content are the same: ' + sourceContent[key]);
        }
        else {
          result[sourceContent[key]] = translationContent[translationXPaths[xpath]];
        }
      }
      else {
        console.log(
          'Cannot match ' + xpath +
          ' hash:' + translationXPaths[xpath] +
          ' translation:' + translationContent[translationXPaths[xpath]]
        );
      }
    }
    callback(result);
  });
}

/**
 *
 */
function init(callback) {
  var argv = process.argv.slice(2);
  if (argv.length != 3) {
    console.log("Syntax: node export.js <source url> <translation url> filename");
    return;
  }
  settings.sourceUrl = argv[0];
  settings.translationUrl = argv[1];
  settings.filename = argv[2];
  callback();
}

init(function(){
  util.runPhantomJs(settings.sourceUrl, function(sourceContent, sourceXPaths){
    runOnTranslations(sourceContent, sourceXPaths, write);
  });
});
