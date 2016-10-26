var config = require('./lib/config'),
    express = require('express'),
    app = express();

app.use(express.static(__dirname + '/public'));

app.listen(config.port, function() {
    console.log('Client listening at %d ...', config.port);
});
