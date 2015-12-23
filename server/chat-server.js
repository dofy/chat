var server = require('http').createServer(),
    io = require('socket.io')(server),
    config = require('./lib/config'),
    users = {};

io.on('connection', function(sock) {
    // connected
    console.log('connected', sock.id);
    // disconnected
    sock.on('disconnect', function() {
        console.log('disconnected', sock.id);
        users[sock.id].state = 'offline';
        sock.broadcast.emit('exit', {
            id: sock.id,
            users: users,
            time: new Date()
        });
    });


    users[sock.id] = {
        name: null,
        state: 'online'
    };
    // my id
    sock.emit('myid', {
        id: sock.id
    });
    // set name
    sock.on('name', function(data) {
        console.log('- name', data);
        for (var id in users) {
            if (users[id].name === data && users[id].state ===
                'online') {
                sock.emit('err', 'Name is exists.');
                return;
            }
        }
        users[sock.id].name = data;
        var result = {
            id: sock.id,
            users: users,
            time: new Date()
        };
        sock.emit('name', result);
        sock.broadcast.emit('join', result);
    });
    // message
    sock.on('message', function(data) {
        console.log('message');
        console.log(data);
        var result = {
            id: sock.id,
            message: data,
            time: new Date()
        };
        sock.emit('self', result);
        sock.broadcast.emit('message', result);
    });
});

server.listen(config.port, function() {
    console.log('Server listening at %d ...', config.port);
});
