'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let app = express();

const token = 'CAABflhqiHg8BAMwCf5nJ6cV7gfjN9UB3IjBpk581PGJrfsc7rOTmy68knpS51ASelgEyOIMxoyEKIZCWZCigz8qU7Rwkz7pKxQSWLJjei1CSl5KD8Prngcmst0Hd1PzU9mUgFpTBfEjlt2zbgGxWmXDTqZAaRNXNXiF8dsyfTNVF6cxEC13YmvZBjmQHXtJmYp3b9OWZABwZDZD';
app.set('port', (process.env.PORT || 2377));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("I'm Kotahi, let's play!");
});

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'moemoea_NZ') {
    res.send(req.query['hub.challenge']);
  }

  res.send('You tried, you failed.');
});

let players = [];

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function handleMessage(senderId, text) {
    const isNewPlayer = !!players[senderId];
    const isNewGame = players[senderId].number;
    let answer = '';

    if (isNewPlayer || isNewGame) {
        const number = getRandomNumber(1, 100);
        players[senderId] = { game: 'moreOrLess', try: 0, number };
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
                answer = 'Awesome! You found it after ' + guessTry + 'retry. I\'ve already picked another one, find it! Haha';
                players[senderId].try = 0;
                delete players[senderId].number;
            } else if(guessUnder) {
                answer = 'It\'s more!';
            } else if(guessOver) {
                answer = 'It\'s less!';
            }
        }
    }

    sendTextMessage(senderId, answer);
}

function sendTextMessage(sender, text) {
  const messageData = {
    text,
};

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
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
      sendTextMessage(sender, 'Text received, echo: ' + text.substring(0, 200));
    }
  }

  res.sendStatus(200);
});

app.listen(app.get('port'), function () {
  console.log('Kotahi ready at ' + app.get('port'));
});
