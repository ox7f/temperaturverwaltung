const Database      = require('./database');
const routes        = require('./routes');

const session       = require('express-session')
const express       = require('express')
const app           = express()

const port          = 1337
const db            = new Database('temperaturverwaltung.db')

// set views to views folder
app.set('views', './views')

// set the view engine to ejs
app.set('view engine', 'ejs')

// session settings
app.use(session({
    secret: 'secret', // needs something more secure
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 // 1 h
    }
}))

app.use(express.urlencoded({extended : true}))
app.use(express.json())

app.use('/static', express.static('./static'))
app.use(routes(db))

// undefined endpoints return 404 + message
app.all('*', (req, res) => {
    return res.status(404).send({
        message: '404 page not found'
    })
});

// server starten
(async () => {
    await db.connect()
    await db.migrate()

    app.listen(port, () => console.log(`Listening on port ${port}`))
})()

