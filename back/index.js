const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    console.log('New connection');
    socket.on('login', trigram => {
        if(trigram.length !== 3 && trigram.match(/[^A-Z]/g) !== null) {
            console.log('Received invalid trigram:', trigram);
            socket.emit('login', false);
        }
        console.log('Trigram:', trigram);
        if(trigram.includes('A')) socket.emit('login', true);
        else socket.emit('login', false);
    });
});

http.listen(8081, () => {
    console.log('listening on *:8081');
});
