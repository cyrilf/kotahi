'use strict';

let express = require('express');
let app = express();
const DEFAULT_PORT = 2377;

app.get('/', function (req, res) {
  res.send("I'm Kotahi, let's play!");
});

app.listen(DEFAULT_PORT, function () {
  console.log('Kotahi ready at ' + DEFAULT_PORT);
});
