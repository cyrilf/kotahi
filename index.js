'use strict';

let express = require('express');
let bodyParser = require('body-parser');
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

function sendTextMessage(sender, text) {
  const messageData = {
    text,
  }

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
      sendTextMessage(sender, 'Text received, echo: ' + text.substring(0, 200));
    }
  }

  res.sendStatus(200);
});

app.listen(app.get('port'), function () {
  console.log('Kotahi ready at ' + app.get('port'));
});
