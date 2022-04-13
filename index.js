const express = require('express');
const bodyParser = require('body-parser');
const Hypixel = require('hypixel-api-reborn');
const Mojang = require('mojang-api-js');
const mojang = new Mojang();
const hypixel = new Hypixel.Client('HYPIXEL-API-KEY')
const app = express();
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
})

app.post('/friends', (req, res) => {
    var onlineFriends = [];

    if (req.body.player == null) res.send(['must input player name']);

    hypixel.getFriends(req.body.player).then(friends => {
        for (let x = 0; x < friends.length; x++) {
            hypixel.getPlayer(friends[x].uuid).then(player => {
                if (player.isOnline) {
                    onlineFriends.push(player.nickname);
                }

                if (x == friends.length - 1) {
                    res.send(onlineFriends);
                }
            }).catch(() => {
                res.send(['error retrieving friends']);
            });
        }
    }).catch(error => {
        res.send(['error, invalid ign: ' + error]);
    });
});

async function getNameFromUUID(uuid) {
    let friendIgn = await mojang.uuidToName(uuid);
    return friendIgn
}

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});