var page = require('webpage').create();
var address = "https://www.transifex.com";
page.open(address, function(status) {
  var result = page.evaluate(function() {
    var segments = window.Transifex.live.segments;
    var result = [];
    for (var key in segments) {
      var segment = segments[key];
      result.push({
        key: segment.key,
        source_string: segment.source_string
      });
    }
    return result;
  });
  console.log(JSON.stringify(result));
  phantom.exit();
});

