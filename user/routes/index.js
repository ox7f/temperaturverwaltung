const path              = require('path');
const express           = require('express');
const router            = express.Router();

// beim aufruf von http://localhost:$PORT/ wird die datei views/index.html zum client geschickt
router.get('/', (req, res) => {
    return res.sendFile(path.resolve('views/index.html'));
});

// das hier ist die zentrale backend stelle
// hier koennen wir POST Requests vom user/admin interface verarbeiten

// todo - Endpoints erstellen
// hier am besten die npm express docs anschauen (https://www.npmjs.com/package/express),

router.post('/api/todo', (req, res) => {
	// todo
});

module.exports = router;
