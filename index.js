var express = require('express');
var app = express();
var cons = require('consolidate');
var multer = require('multer');
var storage = multer.diskStorage({
  destination:  function (req, file, callback) {
                  callback(null, './data');
                },
                filename: function (req, file, callback) {
                  callback(null, file.fieldname + '.json');
                }
              });

var uploadGraph = multer({ storage : storage}).single('graph');
var uploadGame = multer({ storage : storage}).single('game');

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.use(express.static('./'));

app.get('/', function(req, res) {
  res.render('playground.html', {
    title: 'Playground'
  });
});

app.post('/graph', function(req, res){
  uploadGraph(req, res, function(err) {
    if(err) {
      return res.end("Error uploading file.");
    }
  res.redirect('/');
  });
});

app.post('/game', function(req, res){
  uploadGame(req, res, function(err) {
    if(err) {
      return res.end("Error uploading file.");
    }
  res.redirect('/');
  });
});

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;


var d = new Date();
app.listen(port, ipaddress, function() {
  console.log( d + ' | Starting server at localhost:8080 ... 👺 ');
});
