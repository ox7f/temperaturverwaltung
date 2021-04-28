const routes        = require('./routes');
const path          = require('path');
const express       = require('express');
const app           = express();
const port          = 1337; // port auf den der server horcht

// /static verfuegbar machen
app.set('views','./views');

app.use(express.json());
app.use('/static', express.static(path.resolve('static')));
app.use(routes);

app.all('*', (req, res) => {
    return res.status(404).send('404 page not found');
});

app.listen(1337, () => console.log(`Server running on port ${port}`));
