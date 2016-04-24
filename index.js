'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let app = express();

app.set('port', (process.env.PORT || 2377));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("I'm Kotahi, let's play!");
});

app.get('/webhook/', (req, res) => {
    if (req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }

    res.send('You tried, you failed.');
});

let players = [];

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function handleMessage(senderId, text) {
    const isNewPlayer = !players[senderId];
    let answer = '';

    if (isNewPlayer) {
        const number = getRandomNumber(1, 100);
        players[senderId] = { game: 'moreOrLess', try: 1, number: number };
        answer = 'I\'ve pick a random number between 1 and 100. Find it!';
    } else {
        const numberToGuess = players[senderId].number;
        const guessTry = players[senderId].try;
        const guess = parseInt(text);
        const guessValid = guess && guess > 0 && guess <= 100;
        const guessWin = guess === numberToGuess;
        const guessUnder = guess < numberToGuess;
        const guessOver = guess > numberToGuess;

        answer = 'I dont\'t get it.. Please enter a valid number';

        if (guessValid) {
            if (guessWin) {
                answer = 'Awesome! You found it after ' + guessTry + ' try.';
                delete players[senderId];
            } else {
                if(guessUnder) {
                    answer = 'It\'s more!';
                } else if(guessOver) {
                    answer = 'It\'s less!';
                }

                players[senderId].try += 1;
            }
        }
    }

    sendTextMessage(senderId, answer);
}

function sendTextMessage(sender, text) {
    const messageData = {
        text: text,
    };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, (error, response, body) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.post('/webhook/', (req, res) => {
    const messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
        const event = req.body.entry[0].messaging[i];
        const sender = event.sender.id;
        if (event.message && event.message.text) {
            let text = event.message.text;
            handleMessage(sender, text);
        }
    }

    res.sendStatus(200);
});

app.listen(app.get('port'), function () {
    console.log('Kotahi ready at ' + app.get('port'));
});
