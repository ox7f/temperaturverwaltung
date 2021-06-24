const sqlite = require('sqlite-async')

class Database {
    constructor(db_file) {
        this.db_file = db_file
        this.db = undefined
    }
    
    // connect to db
    async connect() {
        this.db = await sqlite.open(this.db_file)
    }

    // db migration
    async migrate() {
        return this.db.exec(`
            DROP TABLE IF EXISTS Temperatur;
            DROP TABLE IF EXISTS User;

            CREATE TABLE IF NOT EXISTS Temperatur (
                id      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                sensor  INTEGER,
                value   INTEGER,
                time    DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS User (
                id      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                passwd  VARCHAR(255) NOT NULL,
                email   VARCHAR(255) NOT NULL,
                admin   BIT DEFAULT 0 NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Hersteller (
                id      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                name    VARCHAR(255) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Sensor (
                id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                hersteller_id   INTEGER NOT NULL,
                adresse         VARCHAR(255),
                serverschrank   VARCHAR(255) NOT NULL
            );

            INSERT INTO User (passwd, email, admin) VALUES 
                ('test123', 'test@test.de', 0),
                ('admin123', 'admin@admin.de', 1);

            INSERT INTO Temperatur (sensor, value) VALUES 
                (1, 21), (1, 22), (1, 15),
                (2, 23), (2, 24), (2, 29),
                (3, 20), (3, 21), (3, 21);

            INSERT INTO Hersteller (name) VALUES 
                ('Hersteller 1'),
                ('Hersteller 2'),
                ('Hersteller 3');

            INSERT INTO Sensor (hersteller_id, adresse, serverschrank) VALUES 
                (1, 'Adresse 1', 1),
                (1, 'Adresse 1', 1),
                (2, 'Adresse 2', 2),
                (2, 'Adresse 2', 2),
                (3, 'Adresse 3', 3);
        `)
    }

    // user login
    async login(email, password) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'SELECT * FROM User WHERE email = ? AND passwd = ?'
                resolve(await this.db.get(query, [email, password]))
            } catch(e) {
                reject(e)
            }
        })
    }

    // user signup
    async signup(email, passwd, passwd2) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'INSERT INTO User (email, passwd) VALUES (?, ?)'
                resolve(await this.db.run(query, [email, passwd]))
            } catch(e) {
                reject(e)
            }
        })
    }

    // add value
    async add(sensor, value) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'INSERT INTO Temperatur (sensor, value) VALUES (?, ?)'
                resolve(await this.db.run(query, [sensor, value]))
            } catch(e) {
                reject(e)
            }
        })
    }

    // remove value
    async remove(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'DELETE FROM Temperatur WHERE id = ?'
                resolve(await this.db.run(query, [id]))
            } catch(e) {
                reject(e)
            }
        })
    }

    // get values
    async list(filter) {
        return new Promise(async (resolve, reject) => {
            let query

            switch(filter) {
                // temperaturwerte
                case 'a':
                    query = 'SELECT sensor, time, value FROM Temperatur ORDER BY time'
                    break
                case 'e':
                    query = 'SELECT sensor, time, value FROM Temperatur ORDER BY time LIMIT 10'
                    break
                case 'f':
                    query = 'SELECT sensor, time, value FROM Temperatur ORDER BY time LIMIT 10 DESC'
                    break
                case 'g':
                    query = 'SELECT sensor, time, value FROM Temperatur MAX(value) ORDER BY time'
                    break
                case 'h':
                    query = 'SELECT sensor, time, value FROM Temperatur AVG(value) ORDER BY time'
                    break
                // todo: sensor und hersteller
                case 'b':
                    query = 'SELECT h.name, s.adresse, s.serverschrank FROM Sensor s JOIN Hersteller h ON h.id = s.hersteller_id GROUP BY s.id'
                    break
                // todo: sensor und temperaturwerte (auch sensoren ohne temp-werte)
                case 'c':
                    query = 'SELECT t.sensor, t.time, t.value, s.id, s.adresse, s.serverschrank FROM Temperatur t LEFT JOIN Sensor s ON s.id = t.sensor ORDER BY time'
                    break
                // todo: temperaturwerte mit sensor und hersteller
                case 'd':
                    query = 'SELECT h.name, s.adresse, s.serverschrank, t.time, t.value  FROM Sensor s JOIN Hersteller h ON h.id = s.hersteller_id JOIN Temperatur t ON t.sensor = s.id'
                    break
            }

            try {
                 resolve(await this.db.all(query))
            } catch(e) {
                reject(e)
            }
        })
    }
}

module.exports = Database