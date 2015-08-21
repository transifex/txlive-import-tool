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
    //get json by get stdout part of [LIVE_EXPORT_BEGIN] and [LIVE_EXPORT_END]
    var begin_tag = '[LIVE_EXPORT_BEGIN]';
    var end_tag = '[LIVE_EXPORT_END]';
    var begin_index = stdout.indexOf(begin_tag) + begin_tag.length;
    var end_index = stdout.indexOf(end_tag);
    try {
      var result = JSON.parse(
        stdout.substr(begin_index, end_index - begin_index)
      );
      callback(result);
    }
    catch(error) {
      console.error(stdout);
      console.error(error);
    }
  });
}

exports.runPhantomJs = runPhantomJs;
