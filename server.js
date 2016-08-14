var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var clientsList = [];
var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.use(express.static(__dirname));

app.get('*', function(req, res) {
   res.send('oops', 404);
});

server.listen(serverPort, serverIpAddress, function() {
   console.log('Listening on ' + serverIpAddress + ', port ' + serverPort);
});

setInterval(function() {
   io.emit('client count', clientsList.length);
   io.emit('client list', clientsList);
}, 100);

io.on('connection', function(socket) {

   var name = '';

   socket.on('chat message', function(data) {
      console.log('message from \'' + data.name + '\' with text \'' + data.text + '\' at ' + data.time);
      socket.broadcast.emit('chat message', data);
   });
   socket.on('image message', function(data) {
      console.log('image message from \'' + data.name + '\' with url ' + data.url + ' at ' + data.time);
      socket.broadcast.emit('image message', data);
   });
   socket.on('youtube message', function(data) {
      console.log('youtube video from \'' + data.name + '\' with url ' + data.url + ' at ' + data.time);
      socket.broadcast.emit('youtube message', data);
   });

   socket.on('user request', function(username) {

      name = username;
      clientsList.push(name);
      io.emit('userConnect', username);
      console.log('user connected with username \'' + username + '\', client count ' + clientsList.length);

   });
   socket.once('disconnect', function() {
      if (name !== '') {
         clientsList.splice(clientsList.indexOf(name), 1);
         io.emit('userDisconnect', name);
         io.emit('userTyping', false);
         console.log('user ' + name + ' has disconnected, client count ' + clientsList.length);
      }
   });
   socket.on('logout', function(username) {
      if (username !== '') {
         clientsList.splice(clientsList.indexOf(username), 1);
         io.emit('userDisconnect', username);
         io.emit('userTyping', false);
         console.log('user ' + username + ' has logged out, client count ' + clientsList.length);
      }
   });
   socket.on('typing', function(name) {
      if (name !== false) {
         io.emit('userTyping', name);
      } else {
         io.emit('userTyping', false);
      }
   });
});
