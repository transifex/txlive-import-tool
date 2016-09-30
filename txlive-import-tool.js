var http = require('http');
var https = require('https');
var read = require('read')
var url = require('url');
var util = require('./util');

var settings = {
  tx_url: "https://www.transifex.com"
}

/**
 * Create request options depending if we update or create the resource
 */
function createOptions(content) {
  var options = {
    host: settings.host,
    port: settings.port,
    headers: {
      'Authorization' : 'Basic ' + new Buffer(settings.username + ':' + settings.password).toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  options.path = '/api/2/project/' + settings.project_slug + '/resource/' + settings.resource_slug + '/content';
  options.method = 'PUT';
  options.data = JSON.stringify({
    content: JSON.stringify(content)
  });

  options.headers['Content-Length'] = Buffer.byteLength(options.data);
  return options;
}

/**
 * Update resource with specified content. Assuming that the resource if
 * exists will have a TX compatible type. If resource doesn't exist we create
 * it.
 */
function updateResource(content, xpaths) {
  console.log(
    "Updating resource " + settings.project_slug + "." + settings.resource_slug +
    " on " + settings.tx_url
  );
  var options = createOptions(content);
  var request = http.request(options, function(response) {
    response.setEncoding('UTF-8');
    var s = '';
    response.on('data', function(data) {
      s += data;
    });
    response.on('end', function() {
      if (response.statusCode >= 400 && response.statusCode != 404)
        console.log(s);
    });
    if (response.statusCode == 404) {
      console.log("Resource does not exist.");
    }
  });
  request.write(options.data);
  request.end();
}

/**
 * Try to extract needed parameters
 */
function init(callback) {
  var argv = process.argv.slice(2);
  if (argv.length < 4) {
    console.log("Syntax: node txlive-import-tool.js <url> <project slug> <resource slug> <username> [<password>]");
    return;
  }

  var url_info = url.parse(settings.tx_url);
  settings.protocol = url_info.protocol;
  settings.host = url_info.hostname;
  settings.port = url_info.port ? parseInt(url_info.port) : null;
  settings.url = argv[0];
  settings.project_slug = argv[1];
  settings.resource_slug = argv[2];
  settings.username = argv[3];
  if (argv[4]) {
    settings.password = argv[4];
    callback();
  }
  else {
    read(
      {
        prompt: 'Password for ' + settings.protocol + "//" + settings.username + '@' + url_info.host + ": ",
        silent: true
      },
      function(e, password) {
        settings.password = password;
        callback();
      }
    )
  }
}

init(function(){
  util.runPhantomJs(settings.url, updateResource);
});
