var childProcess = require('child_process');
var http = require('http');
var https = require('https');
var path = require('path');
var phantomjs = require('phantomjs');
var read = require('read')
var url = require('url');

var settings = {
  tx_url: "https://www.transifex.com"
}

function runPhantomJs(callback) {
  var childArgs = [
    '--ignore-ssl-errors=true',
    '--ssl-protocol=any',
    path.join(__dirname, 'txlive.phantomjs'),
    settings.url
  ]

  console.log("Running live on " + settings.url);
  childProcess.execFile(phantomjs.path, childArgs, function(e, stdout, stderr) {
    var result = JSON.parse(stdout);
    callback(result);
  });
}

function createOptions(content, update) {
  var options = {
    host: settings.host,
    port: settings.port,
    headers: {
      'Authorization' : 'Basic ' + new Buffer(settings.username + ':' + settings.password).toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  if (!update) {
    options.path = '/api/2/project/' + settings.project_slug + '/resources/';
    options.method = 'POST';
    options.data = JSON.stringify({
      name: settings.resource_slug,
      slug: settings.resource_slug,
      i18n_type: 'TX',
      content: JSON.stringify(content)
    });
  }
  else {
    options.path = '/api/2/project/' + settings.project_slug + '/resource/' + settings.resource_slug + '/content';
    options.method = 'PUT';
    options.data = JSON.stringify({
      content: JSON.stringify(content)
    });
  }
  options.headers['Content-Length'] = Buffer.byteLength(options.data);
  return options;
}

/**
 *
 */
function createResource(content) {
  var protocol = null;
  if (settings.protocol == "https:")
    protocol = https;
  if (settings.protocol == "http:")
    protocol = http;
  if (protocol == null)
    return;
  var options = createOptions(content, false);
  var request = protocol.request(options, function(response) {
    response.setEncoding('utf-8');
    var s = '';
    response.on('data', function(data) {
      s += data;
    });
    response.on('end', function() {
      if (response.statusCode >= 400)
        console.log(s);
    });
  });
  request.write(options.data);
  request.end();
}

/**
 *
 */
function updateResource(content) {
  console.log(
    "Updating resource " + settings.project_slug + "." + settings.resource_slug +
    " on " + settings.tx_url
  );
  var options = createOptions(content, true);
  var request = http.request(options, function(response) {
    response.setEncoding('UTF-8');
    if (response.statusCode == 404) {
      console.log("Resource doesn't exist. Creating...");
      createResource(content);
      return;
    }
    var s = '';
    response.on('data', function(data) {
      s += data;
    });
    response.on('end', function() {
      if (response.statusCode >= 400)
        console.log(s);
    });
  });
  request.write(options.data);
  request.end();
}

/**
 *
 */
function init(callback) {
  var argv = process.argv.slice(2);
  if (argv.length != 4) {
    console.log("Syntax: node txlive-import-tool.js <url> <project slug> <resource slug> <username>");
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
/**
 *
 */
function main() {
  init(function(){
    runPhantomJs(updateResource);
  });
}

main();