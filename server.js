var express = require('express'),
var ambientController = require('../controllers/AmbientController');

app = express(),
port = process.env.PORT || 8080;

app.route('/insert')
    .get(ambientController.insert)
    .post(ambientController.insert);



app.listen(port);

console.log('todo list RESTful API server started on: ' + port);