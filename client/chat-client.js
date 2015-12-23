var express = require('express'),
    app = express(),
    config = require('./lib/config'),
    server = require('http').createServer(app);

server.listen(config.port, function() {
    console.log('Client listening at %d ...', config.port);
});

app.use(express.static(__dirname + '/public'));
