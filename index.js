var Campi = require('campi'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    {Base64Encode} = require('base64-stream');

var campi = new Campi();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
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

                var base64Stream = stream.pipe(Base64Encode());

                base64Stream.on('data', function (buffer) {
                    message += buffer.toString();
                });

                base64Stream.on('end', function () {
                    io.sockets.emit('image', message);
                    busy = false;
                });
            });
        }
    }, 100);
});