express = require('express'),
ambientRoutes = require('./api/routes/AmbientRoutes.js');
port = process.env.PORT || 8080;

server = express()
    .set('view engine', 'ejs')
    .use(require('cookie-parser')())
    .use(require('body-parser').urlencoded({ extended: true }))
    .use(require('body-parser').json())
    .use("/",ambientRoutes)
    .use("/favicon.ico",express.static(__dirname + '/cam42/favicon.ico'))
    .use('/cam42', express.static(__dirname + '/cam42'))
    .get('*', (req, res) => res.redirect('/404.html'))
    .listen(port, () => console.log(`Listening on ${ port }`))

webSocketServer = require('./api/AmbientDataWebSocket.js');

ambientRoutes.webSocketServer=webSocketServer;


console.log('todo list RESTFUL API server started on: ' + port);
