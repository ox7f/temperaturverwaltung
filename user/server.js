const routes        = require('./routes');
const path          = require('path');
const express       = require('express');
const app           = express();
const port          = 1337; // port ueber den man auf die API bzw das frontend zugriff hat

// wir machen den ordner /static fuer das frontend verfuegbar
app.use(express.json());
app.set('views','./views');
app.use('/static', express.static(path.resolve('static')));

app.use(routes);

app.all('*', (req, res) => {
    return res.status(404).send('404 page not found');
});

app.listen(1337, () => console.log(`Server running on port ${port}`));