(function(win, $, io, conf, undef) {
    var sock = io.connect(config.server);
    var myColor, myWidth;
    var box = $('#playground');
    var boxDom = box.get(0);
    var isDown = false;
    var stage = boxDom.getContext('2d');
    // socket system event
    sock.on('connect', function(data) {
        console.log('- connect');
        myColor = getHexColor(Math.floor(Math.random() * 0xffffff));
        myWidth = Math.round(Math.random() * 7 + 2);
    });
    sock.on('disconnect', function(data) {
        console.log('- disconnect');
    });
    // self event
    sock.on('self', function(data) {
        //console.log('- self', data);
        showPoint(data.data);
    });
    // data event
    sock.on('data', function(data) {
        console.log('- data', data);
        showPoint(data.data);
    });
    // bind events
    box.on('mousedown', function(evt) {
        console.log(evt);
        isDown = true;
        sock.emit('data', {
            begin: true,
            color: myColor,
            width: myWidth,
            point: [evt.offsetX, evt.offsetY]
        });
    });
    box.on('mouseup', function(evt) {
        isDown = false;
    })
    box.on('mousemove', function(evt) {
        if(isDown) {
            sock.emit('data', {
                color: myColor,
                point: [evt.offsetX, evt.offsetY]
            });
        }
    })
    function showPoint(data) {
        var color = data.color,
            width = data.width,
            x = data.point[0],
            y = data.point[1];
        if(data.begin) {
            stage.strokeStyle = color;
            stage.lineWidth = width;
            stage.beginPath();
            stage.moveTo(x, y);
        } else {
            stage.lineTo(x, y);
            stage.stroke();
        }
    }
    function getHexColor(color) {
        var result = color.toString(16);
        while(result.length < 6) {
            result = '0' + result;
        }
        return '#' + result;
    }
})(window, jQuery, io, config);
