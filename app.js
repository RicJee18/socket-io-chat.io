const express = require('express')

var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 7001;

app.use(express.static('public'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


const activeUsers = new Set();
var userNames={}

io.on('connection', function (socket) {
    socket.on('new user', function (user) {
        socket.userId = user;
        activeUsers.add(user)
        io.emit('new user', [...activeUsers], user);
        var userName = user.name;
        var userId = user.userId;
        userNames[userName] = userId;
        io.emit("mijoin",userNames)

    })
    socket.on('chat message', function (msg) {
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('typing', function (user) {
        socket.broadcast.emit('typing', user);
    })

    socket.on('out typing', function () {
        socket.broadcast.emit('out typing');
    })
    socket.on('private', (data)=> {
        console.log(data.sender+": "+data.message)
        io.emit(`private-ni`, data)
    });

    socket.on('disconnect', () => {
        activeUsers.delete(socket.userId);
        io.emit('user disconnected', socket.userId, activeUsers.size)
    })
});



http.listen(port, function () {
    console.log('Server is running at http://localhost:' + port);
});