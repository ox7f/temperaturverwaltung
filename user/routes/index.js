const path              = require('path');
const express           = require('express');
const router            = express.Router();

// beim aufruf von http://localhost:$PORT/ wird die datei views/index.html angezeigt
router.get('/', (req, res) => {
    return res.sendFile(path.resolve('views/index.html'));
});

// das hier ist die zentrale backend stelle
// hier koennen wir POST Requests vom user/admin interface verarbeiten

// todo - endpoints erstellen
// hier am besten die npm express docs anschauen (https://www.npmjs.com/package/express),
// das req object besitzt halt die daten, die wir vom admin-interface bzw vom user-interface schicken
// das res object besitzt funktionen wie res.send() / res.sendFile(), damit senden wir eine response zurueck (update war erfolgreich beispielsweise)

router.post('/api/todo', (req, res) => {
	// todo
});

module.exports = router;