var phantomjs = require('phantomjs');
var path = require('path');
var childProcess = require('child_process');

/**
 * Runs phantomjs in order to extract source strings
 */
function runPhantomJs(url, callback) {
  var childArgs = [
    '--ignore-ssl-errors=true',
    '--ssl-protocol=any',
    //'--load-images=false',
    path.join(__dirname, 'txlive.phantomjs'),
    url
  ]

  console.log("Running live on " + url);
  childProcess.execFile(phantomjs.path, childArgs, function(e, stdout, stderr) {
    if (e) {
      console.log("Phantomjs failed on " + url);
      if (stderr) console.error(stderr);
      return;
    }

    //get strings json by get stdout part of [LIVE_EXPORT_BEGIN] and [LIVE_EXPORT_END]
    var export_begin_tag = '[LIVE_EXPORT_BEGIN]';
    var export_end_tag = '[LIVE_EXPORT_END]';
    var export_begin_index = stdout.indexOf(export_begin_tag) + export_begin_tag.length;
    var export_end_index = stdout.indexOf(export_end_tag);
    var strings;
    try {
      strings = JSON.parse(
        stdout.substr(export_begin_index, export_end_index - export_begin_index)
      );
    }
    catch(error) {
      console.error(stdout);
      console.error(error);
      return;
    }

    //get xpath json by get stdout part of [LIVE_XPATH_BEGIN] and [LIVE_XPATH_END]
    var xpath_begin_tag = '[LIVE_XPATH_BEGIN]';
    var xpath_end_tag = '[LIVE_XPATH_END]';
    var xpath_begin_index = stdout.indexOf(xpath_begin_tag) + xpath_begin_tag.length;
    var xpath_end_index = stdout.indexOf(xpath_end_tag);
    var xpaths;
    try {
      xpaths = JSON.parse(
        stdout.substr(xpath_begin_index, xpath_end_index - xpath_begin_index)
      );
    }
    catch(error) {
      console.error(stdout);
      console.error(error);
      return;
    }
    callback(strings, xpaths);
  });
}

exports.runPhantomJs = runPhantomJs;
