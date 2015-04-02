var Campi = require('campi'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    base64 = require('base64-stream');

var campi = new Campi();

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

http.listen(3000, function () {
    var busy = false;
    console.log('listening on port 3000');

    setInterval(function () {
        if (!busy) {
            busy = true;
            campi.getImageAsStream({
                width: 640,
                height: 480,
                shutter: 200000,
                timeout: 1,
                nopreview: true
            }, function (err, stream) {
                var message = '';

                var pipe = stream.pipe(base64.encode());

                pipe.on('data', function (buffer) {
                    message += buffer.toString();
                });

                pipe.on('end', function () {
                    io.sockets.emit('image', message);
                    busy = false;
                });
            });
        }
    }, 100);
});