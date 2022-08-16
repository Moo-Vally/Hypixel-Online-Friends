const bodyParser = require('body-parser');
const Hypixel = require('hypixel-api-reborn');
const hypixel = new Hypixel.Client('089d7117-57d7-4307-8f46-335edae18cd2');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setTimeout(100000, () => {
        console.log('Request has timed out.');
        res.status(503).send('Service unavailable. Please retry.');
    });
    next();
});

io.on('connection', (socket) => {
    socket.on('getPlayer', (ign) => {
        if (ign == null) socket.emit('setFriend', 'must input player name');

        hypixel.getFriends(ign).then(friends => {
            for (let x = 0; x < friends.length; x++) {
                hypixel.getPlayer(friends[x].uuid).then(player => {
                    if (player.isOnline) {
                        socket.emit('setFriend', `[${player.rank}] ${player.nickname}`);
                    }

                    if (x == friends.length - 1) socket.emit('done');
                }).catch(() => {
                    socket.emit('setFriend', 'error retrieving friends');
                });
            }
        }).catch(error => {
            socket.emit('setFriend', 'error invalid ign');
        });
    });
});

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});