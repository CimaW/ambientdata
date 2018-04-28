express = require('express'),
ambientRoutes = require('./api/routes/AmbientRoutes.js');

app = express(),
port = process.env.PORT || 8080;

express()
    .set('view engine', 'ejs')
    .use(require('cookie-parser')())
    .use(require('body-parser').urlencoded({ extended: true }))
    .use(require('body-parser').json())
    .use("/",ambientRoutes)
    .get('*', (req, res) => res.redirect('/404.html'))
    .listen(port, () => console.log(`Listening on ${ port }`))

console.log('todo list RESTful API server started on: ' + port);