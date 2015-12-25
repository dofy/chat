(function(win, $, io, conf, undef) {
    var CHANNEL = 'demo.chat';
    var sock = io.connect(config.server);
    var myid, myname,
        users = {},
        joinin = false;
    // socket system event
    sock.on('connect', function(data) {
        console.log('- connect');
    });
    sock.on('disconnect', function(data) {
        joinin = false;
        console.log('- disconnect');
    });
    // error
    sock.on('err', function(err) {
        $('#input-name').val(err).select();
    });
    // self id
    sock.on('myid', function(data) {
        console.log('- myid', data);
        myid = data.id;
        // show set name dialog
        $('#dialog-name').dialog({
            width: 350,
            height: 160,
            modal: true,
            closeOnEsc: false,
            resizeAble: false,
        });
    });
    // set name
    sock.on('name', function(data) {
        console.log('- name', data);
        if(data.channel !== CHANNEL)
            return;
        joinin = true;
        refreshUserList(data);
        myname = fixHtml(users[myid].name);
        showLog('-', '-= Welcome<span class="self">' + myname + '</span>:D =-')
        $('#dialog-name').dialog('close');
        $('#input-message').focus();
        $('#myid').html(myname);
    });
    // other guy join in
    sock.on('join', function(data) {
        console.log('- join', data);
        if(data.channel !== CHANNEL)
            return;
        joinin && refreshUserList(data);
        showLog('joined', users[data.id]);
    });
    // other guy exit
    sock.on('exit', function(data) {
        console.log('- exit', data);
        joinin && refreshUserList(data);
        showLog('left', users[data.id]);
    });

    // self message
    sock.on('self', function(data) {
        console.log('- self', data);
        if(data.channel !== CHANNEL)
            return;
        joinin && showMessage(data);
    });
    // somebody's message
    sock.on('message', function(data) {
        console.log('- message', data);
        if(data.channel !== CHANNEL)
            return;
        joinin && showMessage(data);
    });

    // send message
    $('#input-message')
    .on('keypress', function(evt) {
        var msg = $(this).val().trim();
        switch (evt.which) {
            case 13: // enter
                if (msg !== '') {
                    sendMessage(msg);
                    this.value = '';
                }
                break;
            befault:
                // nothing...
                break;
        }
    });

    $('#input-name')
    .on('keypress', function(evt) {
        if (evt.which === 13) {
            var name = $(this).val().trim();
            if (name !== '') {
                sock.emit('name', name, CHANNEL);
            }
        }
    });

    function sendMessage(msg) {
        sock.emit('message', msg, CHANNEL);
    }

    function showMessage(data) {
        $('#message-list').append(
            '<li>' + ( data.id === myid ? '<span class="name self">' : '<span class="name">') +
            fixHtml(users[data.id].name) + '</span>' +
            '<span class="message-item">' + fixHtml(data.message) + '</span>' +
            '<span class="time">' + moment(data.time).format( 'HH:mm:ss') + '</span>' + '</li>'
        );
        $('.message')[0].scrollTop = $('.message')[0].scrollHeight;
    }

    function showLog(type, data) {
        if(!data)
            return;
        var log = '';
        if (type === '-') {
            log = data;
        } else {
            log = (data.name ? data.name : '<em>[Unnamed]</em>') + ' ' + type + '.';
        }
        $('#message-list').append('<li class="log">' + log + '</li>');
        $('.message')[0].scrollTop = $('.message')[0].scrollHeight;
    }

    function fixHtml(str) {
        return str ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    }

    function refreshUserList(data) {
        var userList = $('#user-list'),
            onNums = 0;
        users = data.users;
        users[myid].state = 'self';
        userList.html('');
        for (var id in users) {
            if (users[id].state !== 'offline') {
                onNums++;
                if (users[id].state !== 'self') {
                    console.log('.....', users[id]);
                    userList.append('<li>' + (users[id].name ? fixHtml(users[id].name) : '<em>[Unnamed]</em>') + '</li>');
                }
            }
        }
        userList.prepend('<li><span class="self">' + fixHtml(users[myid].name) + '</span></li>');
        userList.prepend('<li><em>- Online (' + onNums + ')</em></li>');
    }
})(window, jQuery, io, config);
