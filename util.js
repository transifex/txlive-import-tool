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
    path.join(__dirname, 'txlive.phantomjs'),
    url
  ]

  console.log("Running live on " + url);
  childProcess.execFile(phantomjs.path, childArgs, function(e, stdout, stderr) {
    if (e) {
      console.log("Phantomjs failed on " + url);
      return;
    }
    var result = JSON.parse(stdout);
    callback(result);
  });
}

exports.runPhantomJs = runPhantomJs;
