from flask import Flask, session, jsonify, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
import mysql.connector

app = Flask(__name__)
cors = CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwingersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080')

# datenbank anbindung
mydb = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='temperaturverwaltung'
)

# routing stuff
@app.route('/api/login', methods=['GET', 'POST'])
@cross_origin()
def login():
    data = request.json
    logincursor = mydb.cursor()

    sql = 'SELECT * FROM benutzer WHERE Anmeldename = %s AND Passwort = %s'
    val = (data['name'], data['password'])

    logincursor.execute(sql, val)
    userResult = logincursor.fetchone()
    logincursor.close()

    if (userResult):
        status = True
        session['logged_in'] = status
        session['is_admin'] = userResult[0]
    else:
        return jsonify({'message': 'Benutzer nicht gefunden / Password falsch'})

    response = {
        'loggedin': status,
        'user': {
            'id': userResult[0],
            'name': userResult[1],
            'email': userResult[2],
            'number': userResult[3],
            'isAdmin': userResult[4]
        }
    }

    return jsonify(response)

@app.route('/api/logout', methods=['GET', 'POST'])
@cross_origin()
def logout():
    session.pop('is_admin', None)
    session.pop('logged_in', None)
    return jsonify({'message': 'success'})

@app.route('/api/addTemperatur', methods=['GET', 'POST'])
@cross_origin()
def addTemperature():
    if (session['logged_in'] != True):
        return jsonify({'message': 'Nicht eingeloggt'})

    if (session['is_admin'] == 0):
        return jsonify({'message': 'Bist kein Admin, also verpiss dich'})

    data = request.json

    addcursor = mydb.cursor()

    sql = 'INSERT INTO temperatur (SensorID, Temperatur) VALUES (%s, %s)'
    val = (data.sensorId, data.temperature)

    addcursor.execute(sql, val)
    mydb.commit()
    addcursor.close()

    emit('temperature-added', jsonify(data))

    return jsonify({'message': 'success'})

@app.route('/api/removeTemperature', methods=['GET', 'POST'])
@cross_origin()
def removeTemperature():
    if (session['logged_in'] != True):
        return jsonify({'message': 'Nicht eingeloggt'})

    if (session['is_admin'] == 0):
        return jsonify({'message': 'Bist kein Admin, also verpiss dich'})

    emit('temperature-removed', 'todo: table data aus der datenbank')

    return jsonify({'message': 'success'})

# socket stuff
@socketio.on('connect')
def connected():
    emit('table-data', 'todo: table data aus der datenbank')

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)