/**
 * Created by welly on 1/10/2016.
 */

// server variables
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// global variables
var players = [];
var hosts = [];

// web socket
io.on('connection', function(socket){
    // when the player logs in
    socket.on('login', function (data, callback){
        var user = JSON.parse(data);

        if(players.indexOf(user.username) != -1){
            callback(false);
        }
        else {
            callback(true);
            socket.username = user.username;
            players.push(socket.username);
            socket.emit('logged in');
        }
    });

    // when the player choose to host a game
    socket.on('host', function (data, callback) {
        hosts.push(socket.username);
        socket.room = socket.username;
        socket.join(socket.username);
        socket.emit('hosting');
    });

    // when the player choose to join a game
    socket.on('join', function (data, callback) {
        var host = hosts[0];
        hosts.shift();
        socket.room = host;
        socket.join(host);
        socket.emit('joined');
        socket.to(socket.room).emit('start game');
    });

    // when users disconnect
    socket.on('disconnect', function (data, callback) {
        if(!socket.username) return;
        players.splice(players.indexOf(socket.username), 1);
    });
});

// run the server
server.listen(process.env.PORT || 3000);
