'use strict';

let express = require('express');
let app = express();

app.set('port', (process.env.PORT || 2377));

app.get('/', (req, res) => {
  res.send("I'm Kotahi, let's play!");
});

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'moemoea_NZ') {
    res.send(req.query['hub.challenge']);
  }

  res.send('You tried, you failed.');
});

app.post('/webhook/', (req, res) => {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      // Handle a text message from this sender
    }
  }
  res.sendStatus(200);
});

app.listen(app.get('port'), function () {
  console.log('Kotahi ready at ' + app.get('port'));
});
