const Database      = require('./database');
const routes        = require('./routes');

const session       = require('express-session')
const express       = require('express')
const Server        = require('http').Server

const app           = express()
const server        = Server(app);
const sio           = require('socket.io')(server)

const db            = new Database('temperaturverwaltung.db')

// middleware
const sessionMiddleware = session({
    secret: 'secret string',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 // 1 h
    }
})

// use middleware
app.use(sessionMiddleware)
sio.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next)
})

// set views to views folder
app.set('views', './views')

// set the view engine to ejs
app.set('view engine', 'ejs')

// socket stuff
sio.sockets.on('connection', socket => {
    const session = socket.request.session
    session.connections++
    session.save()

    let tableData = 'test'

    // todo
    socket
    .on('join', data => {})
    .on('leave', data => {})
    .on('addTemp', data => {

    })
    .on('removeTemp', data => {

    })
    .emit('table-data', tableData)
})

app.use(express.urlencoded({extended : true}))
app.use(express.json())

app.use('/static', express.static('./static'))
app.use(routes(db))

// endpoints return 404 + message
app.all('*', (req, res) => {
    return res.status(404).send({
        message: '404 page not found'
    })
});

// server starten
(async () => {
    await db.connect()
    await db.migrate()

    server.listen(1337)
})()