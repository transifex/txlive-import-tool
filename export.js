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
function runOnTranslations(sourceContent, callback) {
  util.runPhantomJs(settings.translationUrl, function(content) {
    var translationContent = content;
    console.log(sourceContent.length);
    console.log(translationContent.length);
    if (translationContent.length != sourceContent.length)
      throw new Error("Source and translation url don't contain same number of live strings");
    var result = {}
    for (var i in sourceContent) {
      result[sourceContent[i].key] = translationContent[i].source_string;
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
  util.runPhantomJs(settings.sourceUrl, function(sourceContent){
    runOnTranslations(sourceContent, write);
  });
});

