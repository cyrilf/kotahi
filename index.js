'use strict';

let express = require('express');
let app = express();

app.set('port', (process.env.PORT || 2377));

app.get('/', function (req, res) {
  res.send("I'm Kotahi, let's play!");
});

app.listen(app.get('port'), function () {
  console.log('Kotahi ready at ' + app.get('port'));
});
