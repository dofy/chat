(function(win, $, io, conf, undef) {
    var sock = io.connect(config.server);

    var myid, mycolor, users = {};
    // socket system event
    sock.on('connect', function(data) {
        console.log('- connect');
        mycolor = getHexColor(Math.floor(Math.random() * 0xffffff));
    });
    sock.on('disconnect', function(data) {
        console.log('- disconnect');
    });
    // myid event
    sock.on('myid', function(data) {
        console.log('- myid', data);
    });
    // self event
    sock.on('self', function(data) {
        console.log('- self', data);
        showPoint(data.data);
    });
    // message event
    sock.on('data', function(data) {
        console.log('- data', data);
        showPoint(data.data);
    });
    var m = $('.playground');
    var isDown = false;
    m.on('mousedown', function(evt) {
        isDown = true;
        sock.emit('data', {
            color: mycolor,
            point: [evt.clientX, evt.clientY]
        });
    });
    m.on('mouseup', function(evt) {
        isDown = false;
    })
    m.on('mousemove', function(evt) {
        if(isDown) {
            sock.emit('data', {
                color: mycolor,
                point: [evt.clientX, evt.clientY]
            });
        }
    })
    function showPoint(data) {
        var color = data.color,
            x = data.point[0],
            y = data.point[1];
        x = Math.floor(x / 10) * 10;
        y = Math.floor(y / 10) * 10;
        m.append( '<div class="point" style="left:' + x + 'px;top:' + y +
            'px;background-color:' + color + '"></div>');
    }
    function getHexColor(color) {
        var result = color.toString(16);
        while(result.length < 6) {
            result = '0' + result;
        }
        return '#' + result;
    }
})(window, jQuery, io, config);
