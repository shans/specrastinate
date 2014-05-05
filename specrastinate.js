#!/usr/bin/env node

var express = require('express'),
  sharejs = require('share'),
  hat = require('hat').rack(32, 36);

var argv = require('optimist').
  usage("Usage: $0 [-p portnum]").
  default('p', 8000).
  alias('p', 'port').
  argv;

var fs = require('fs');
var child_process = require('child_process');

var server = express();
server.use(express.static(__dirname + '/spec'));

var options = {
  db: {type: 'none'},
  browserChannel: {cors: '*'}
};

var port = argv.p;

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.server.attach(server, options);

server.listen(port);

process.title = 'sharejs'
process.on('uncaughtException', function (err) {
  console.error('An error has occurred. Please file a ticket here: https://github.com/josephg/ShareJS/issues');
  console.error('Version ' + sharejs.version + ': ' + err.stack);
});

var timestamp = 0;
var bikeshedding = false;
var needToBikeshed = false;

function bikeshedIt(doc) {
  if (!bikeshedding) {
    bikeshedding = true;
    var text = doc.getText();
    fs.writeFileSync(__dirname + '/spec/Overview.src.html', text);
    child_process.exec('cd spec && bikeshed -f spec', function(err, stdout, stderr) {
      stdout = stdout.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\[1;33m/g, "<span style='color:orange;'>").replace(/\[1;31m/g, "<span style='color:red;'>").replace(/\[0m/g, "</span>");
      fs.writeFileSync(__dirname + '/spec/errors.html', '<pre>' + stdout +  '</pre><script src="timestamp.js"></script>');
      fs.appendFileSync(__dirname + '/spec/Overview.html', '<script src="timestamp.js"></script>');
      fs.writeFileSync(__dirname + '/spec/timestamp.txt', timestamp++);
      bikeshedding = false;
      if (needToBikeshed) { console.log('need to shed'); bikeshedIt(doc); }
      needToBikeshed = false;
    });
  } else {
    needToBikeshed = true;
    console.log('queueing shed');
  }
}


sharejs.client.open('spec', 'text', 'http://localhost:8000/channel', function(error, doc) {
  var text = fs.readFileSync(__dirname + '/spec/Overview.src.html', {encoding: 'utf8'})
  console.log('ready');
  doc.submitOp({i:text, p:0});
  doc.on('change', function(op) {
    bikeshedIt(doc);
  });
});
