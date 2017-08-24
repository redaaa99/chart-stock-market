// server.js
// where your node app starts

// init project
var bodyParser = require('body-parser');
var request = require('request');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
require('dotenv').config();


var stocks = ['FB','MSFT'];
var port = process.env.PORT || 8000;


app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/stocks", function (request, response) {
  response.send(stocks);
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    for(i=0;i<stocks.length;i++)
    {
      if(stocks[i].name===msg)
      {
        return;
      }
    }
    stocks.push(msg);
    io.emit('chat message', stocks);
  });


  socket.on('remove message', function(index){
    stocks.splice(parseInt(index), 1);
    io.emit('remove message', stocks);
  });
});

http.listen(port, function(){
  console.log('listening on *:8000');
});