var server = require('http').createServer(),
    io = require('socket.io')(server),
    config = require('./lib/config'),
    defaultChannel = 'DEFAULT',
    users = {};

io.on('connection', function(sock) {
    // connected
    console.log('[connected]', sock.id);
    // disconnected
    sock.on('disconnect', function() {
        console.log('[disconnected]', sock.id);
        users[sock.id].state = 'offline';
        sock.broadcast.emit('exit', {
            id: sock.id,
            users: users,
            time: new Date()
        });
        delete users[sock.id];
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
    sock.on('name', function(data, channel) {
        channel = channel || defaultChannel;
        console.log('[name]', channel, data);
        // TODO: put users to channel
        for (var id in users) {
            if (users[id].name && users[id].name.toLowerCase() === data.toLowerCase() && users[id].state === 'online') {
                sock.emit('err', 'Name is exists.');
                return;
            }
        }
        users[sock.id].name = data;
        var result = {
            id: sock.id,
            channel: channel,
            users: users,
            time: new Date()
        };
        sock.emit('name', result);
        sock.broadcast.emit('join', result);
    });
    /**
     * message event
     * @param   data    message data
     * @param   channel message channel (default: DEFAULT)
     */
    sock.on('message', function(data, channel) {
        channel = channel || defaultChannel;
        console.log('[message]', channel, data);
        var result = {
            id: sock.id,
            channel: channel,
            message: data,
            time: new Date()
        };
        sock.emit('self', result);
        sock.broadcast.emit('message', result);
    });
    /**
     * data (json data for game)
     * -----------------------------------------
     * // merge to message event
     * // now you can set the message channel
     * -----------------------------------------
    sock.on('data', function(data) {
        console.log('[data]', data);
        var result = {
            id: sock.id,
            data: data,
            time: new Date()
        };
        sock.emit('self', result);
        sock.broadcast.emit('data', result);
    });
    */
});

server.listen(config.port, function() {
    console.log('Server listening at %d ...', config.port);
});
