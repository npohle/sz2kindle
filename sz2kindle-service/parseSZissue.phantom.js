var system = require('system');

var page = new WebPage(), testindex = 0, loadInProgress = false;

page.onConsoleMessage = function(msg) {
    //system.stderr.writeLine(msg);
    system.stdout.writeLine(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
};

page.onLoadFinished = function() {
  loadInProgress = false;
};


var steps = [
  function() {
    //Load Login Page
    page.settings.userAgent = 'Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.3 Kindle/1.0 (screen 600x800)';
    page.open("http://reader.sueddeutsche.de/");
  },
  function() {
    page.evaluate(function() {
      var links = document.getElementsByClassName('c-button c-button--call-to-action');
      for (var i = 0; i < links.length; i++) {
          if(links[i].value.indexOf("SZ#")>-1) {
            console.log(links[i].value);
            return;
          }
      }
      return;
    });
  }
];


interval = setInterval(function() {
  if (!loadInProgress && typeof steps[testindex] == "function") {
    //console.log("step " + (testindex + 1));
    steps[testindex]();
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    //console.log("test complete! ");
    phantom.exit(0);
  }
}, 50);
