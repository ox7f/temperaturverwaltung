const sqlite = require('sqlite-async');

class Database {
    constructor(db_file) {
        this.db_file = db_file;
        this.db = undefined;
    }
    
    async connect() {
        this.db = await sqlite.open(this.db_file);
    }

    async migrate() {
        // todo: hersteller, sensor table
        /*
        CREATE TABLE IF NOT EXISTS Temperatur (
            id      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            todo
        );

        CREATE TABLE IF NOT EXISTS Sensor (
            id      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            todo
        );
        */

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

            INSERT INTO User (passwd, email, admin) VALUES 
                ('test123', 'test@test.de', 0),
                ('admin123', 'admin@admin.de', 1);

            INSERT INTO Temperatur (sensor, value) VALUES 
                (1, 21),
                (1, 22),
                (1, 20),
                (1, 15),
                (2, 23),
                (2, 24),
                (2, 29),
                (2, 21),
                (3, 19),
                (3, 20),
                (3, 21),
                (3, 21);
        `);
    }

    async login(email, password) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'SELECT * FROM User WHERE email = ? AND passwd = ?';
                resolve(await this.db.get(query, [email, password]));
            } catch(e) {
                reject(e);
            }
        });
    }

    // todo
    async signup(email, passwd, passwd2) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'INSERT INTO User (email, passwd) VALUES (?, ?)';
                resolve(await this.db.run(query, [email, passwd]));
            } catch(e) {
                reject(e);
            }
        });
    }

    async add(sensor, value) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'INSERT INTO Temperatur (sensor, value) VALUES (?, ?)';
                resolve(await this.db.run(query, [sensor, value]));
            } catch(e) {
                reject(e);
            }
        });
    }

    async remove(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = 'DELETE FROM Temperatur WHERE id = ?';
                resolve(await this.db.run(query, [id]));
            } catch(e) {
                reject(e);
            }
        });
    }

    async list() {
        return new Promise(async (resolve, reject) => {
            try {
                let query = `SELECT * FROM Temperatur ORDER BY time`;
                resolve(await this.db.all(query));
            } catch(e) {
                reject(e);
            }
        });
    }
}

module.exports = Database;