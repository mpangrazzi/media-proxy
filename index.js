
/**
 * Module dependencies
 */

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var notifier = require('node-notifier');
var id3 = require('id3js');
var format = require('util').format;
var crypto = require('crypto');

var request = require('request').defaults({
  followRedirect: false,
  encoding: null,
  pool: { maxSockets: 1000000 },
  timeout: 30 * 60 * 1000 // 30m
});

var downloads = path.join(__dirname, './downloads');


// generate n-bytes hash

function hash(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

// proxy request

function proxyRequest(req, res) {

  var u = url.parse(req.url);
  var pReq = req.pipe(request(req.url));

  req.on('close', function() {
    pReq.abort();
  });

  pReq.on('error', function() {
    res.statusCode = 504;
    res.end();
  });

  pReq.on('response', function(pRes) {

    // pass

    res.writeHead(pRes.statusCode, pRes.headers);
    pReq.pipe(res);

    // download: audio/mpeg

    if (pRes.headers['content-type'] === 'audio/mpeg') {
      console.log('Detected audio/mpeg (%s), starting download...', req.url);
      download(pReq);
    }

  });

}

// download request

function download(req) {

  var tmpFile = format('tmp-%s', hash(8));
  var tmpPath = path.join(__dirname, './tmp/', tmpFile);

  var dest = fs.createWriteStream(tmpPath);

  req.pipe(dest).on('finish', function() {

    id3({ file: tmpPath, type: id3.OPEN_LOCAL }, function(err, tags) {

      var filename = format('%s - %s.mp3', tags.artist, tags.title);

      console.log('Downloaded: %s', filename);

      var targetPath = path.join(downloads, filename);

      fs.renameSync(tmpPath, targetPath);

      notifier.notify({
        title: 'Download complete',
        message: filename
      });

    });

  });

}

// create proxy

var proxy = http.createServer(proxyRequest);

// go!!

var port = 8001;

proxy.listen(port, function() {
  console.log('media-proxy listening on port %s', port);
});
