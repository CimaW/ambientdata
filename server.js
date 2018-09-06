express = require('express'),
ambientRoutes = require('./api/routes/AmbientRoutes.js');
webSocketServer = require('./api/AmbientDataWebSocket.js');

ambientRoutes.webSocketServer=webSocketServer;

app = express(),
port = process.env.PORT || 8080;

express()
    .set('view engine', 'ejs')
    .use(require('cookie-parser')())
    .use(require('body-parser').urlencoded({ extended: true }))
    .use(require('body-parser').json())
    .use("/",ambientRoutes)
    .use('/cam42', express.static(__dirname + '/cam42'))
    .get('*', (req, res) => res.redirect('/404.html'))
    .listen(port, () => console.log(`Listening on ${ port }`))

console.log('todo list RESTful API server started on: ' + port);
