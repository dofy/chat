(function(win, $, io, conf, undef) {
    var sock = io.connect(config.server);
    var myid, myColor, myWidth, myData;
    var dataStore = [];
    var box = $('#playground');
    var stage = box.get(0).getContext('2d');
    // socket system event
    sock.on('connect', function(data) {
        console.log('- connect');
        myColor = getHexColor(Math.floor(Math.random() * 0xffffff));
        myWidth = Math.round(Math.random() * 7 + 2);
    });
    sock.on('disconnect', function(data) {
        console.log('- disconnect');
    });
    // myid event
    sock.on('myid', function(data) {
        console.log('- myid', data);
        myid = data.id;
    });
    // self event
    sock.on('self', function(data) {
        //console.log('- self', data);
        showPoint(data.id, data.data);
    });
    // data event
    sock.on('data', function(data) {
        console.log('- data', data);
        if(myData) {
            dataStore.push(data);
        } else {
            showPoint(data.id, data.data);
        }
    });
    // bind events
    box.on('mousedown', function(evt) {
        var x = evt.offsetX,
            y = evt.offsetY;
        myData = {
            color: myColor,
            width: myWidth,
            points: [[x, y]]
        };
        // todo: draw
        stage.strokeStyle = myColor;
        stage.lineWidth = myWidth;
        stage.beginPath();
        stage.moveTo(x, y);
    });
    box.on('mouseup', function(evt) {
        var userData;
        sock.emit('data', myData);
        myData = null;
        while(userData = dataStore.pop()) {
            showPoint(userData);
        }
    })
    box.on('mousemove', function(evt) {
        var x, y;
        if(myData) {
            x = evt.offsetX;
            y = evt.offsetY;
            myData.points.push([x, y]);
            stage.lineTo(x, y);
            stage.stroke();
        }
    })
    function showPoint(id, data) {
        var color = data.color,
            width = data.width,
            points = data.points;
        if(id === myid)
            return;
        for(var i = 0, l = points.length; i < l; i++) {
            if(i === 0) {
                stage.strokeStyle = color;
                stage.lineWidth = width;
                stage.beginPath();
                stage.moveTo(points[i][0], points[i][1]);
            } else {
                stage.lineTo(points[i][0], points[i][1]);
                stage.stroke();
            }
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
