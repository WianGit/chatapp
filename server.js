var express = require('express');
var app =express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


var engine = require('consolidate');

app.set('views', __dirname + '/views');
app.engine('html', engine.mustache);
app.set('view engine', 'html');


users = [];
connections = [];

server.listen(process.env.PORT || 3000);

console.log('server running');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api', function (req, res) {
    console.log( req.query.id);
    var id = '';
    if(req.query.id === undefined){
        id=false;
    }else{
        id = req.query.id;
    }
    res.render(__dirname +'/views/api.html',{id:id});
});


io.sockets.on('connection' , function (socket) {
    connections.push(socket);
    console.log('connected %s sockets connected0, ' , connections.length );

    socket.on('disconnect', function (data) {
        // if(!socket.username) return false;
        users.splice(users.indexOf(socket.username, 1));
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected %s sockets connected', connections.length);
    });

    // send messages
    socket.on('send message', function (data) {
        console.log(data);
        io.sockets.emit('new message', {msg:data, user:socket.username});
    });


    //  -------------------------------------------------------------- received APIs
    socket.on('send api', function (data) {
        console.log(data);
        io.sockets.emit('new api', {id:data});
    });


    // new user
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', data);
        console.log(data);
    });

    function updateUsernames() {
        io.sockets.emit('get users', users);
    }
});