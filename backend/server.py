from flask import Flask, session, jsonify, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
import mysql.connector

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='*')

# datenbank anbindung
mydb = mysql.connector.connect(
    host     = 'localhost',
    user     = 'root',
    password = '',
    database = 'temperaturverwaltung'
)

# routing stuff
@app.route('/api/login', methods=['POST'])
@cross_origin(origin='*')
def login():
    data = request.json

    if not data['user']:
        return jsonify({'message': 'Keine Anmeldename definiert'})

    if not data['password']:
        return jsonify({'message': 'Keine Passwort definiert'})

    loginCursor = mydb.cursor()

    sql = 'SELECT * FROM benutzer WHERE Anmeldename = %s AND Passwort = %s'
    val = (data['user'], data['password'])

    loginCursor.execute(sql, val)
    result = loginCursor.fetchone()
    loginCursor.close()

    if (result):
        status = True
        session['logged_in'] = status
        session['is_admin'] = result[0]
        session['username'] = result[1]
        session['email'] = result[2]
    else:
        return jsonify({'message': 'Benutzer nicht gefunden / Password falsch'})

    response = {
        'loggedin': status,
        'user': {
            'id': result[0],
            'name': result[1],
            'email': result[2],
            'number': result[3],
            'isAdmin': result[4]
        }
    }

    #emit('user-data', response)
    return jsonify({'message': 'success'})

@app.route('/api/logout', methods=['POST'])
@cross_origin()
def logout():
    session.pop('is_admin', None)
    session.pop('logged_in', None)
    return jsonify({'message': 'success'})

@app.route('/api/addTemperatur', methods=['POST'])
@cross_origin()
def addTemperature():
    if not session['logged_in']:
        return jsonify({'message': 'Nicht eingeloggt'})

    if (session['is_admin'] == 0):
        return jsonify({'message': 'Bist kein Admin, also verpiss dich'})

    data = request.json

    addCursor = mydb.cursor()

    sql = 'INSERT INTO temperatur (SensorID, Temperatur) VALUES (%s, %s)'
    val = (data.sensorId, data.temperature)

    addCursor.execute(sql, val)
    mydb.commit()
    addCursor.close()

    #emit('temperature-added', 'todo')
    return jsonify({'message': 'success'})

@app.route('/api/removeTemperature', methods=['POST'])
@cross_origin()
def removeTemperature():
    if not session['logged_in']:
        return jsonify({'message': 'Nicht eingeloggt'})

    if (session['is_admin'] == 0):
        return jsonify({'message': 'Bist kein Admin, also verpiss dich'})

    #emit('temperature-removed', 'todo')
    return jsonify({'message': 'success'})

# socket stuff
@socketio.on('connect')
def connect():
    if session and session['logged_in']:
        getTableData()
        getUsers()

@socketio.on('get-table-data')
def getTableData():
    if not session['logged_in']:
        return jsonify({'message': 'Nicht eingeloggt'})

    cursor = mydb.cursor()
    cursor.execute('SELECT * FROM temperatur')

    result = cursor.fetchall()
    cursor.close()

    temperatures = []

    for temp in result:
        tempObject = {
            'id': temp[0],
            'time': temp[1].__str__(),
            'sensorId': temp[2],
            'temperatur': temp[3],
        }

        temperatures.append(tempObject)

    emit('table-data', temperatures)

@socketio.on('get-users')
def getUsers():
    if not session['logged_in']:
        return jsonify({'message': 'Nicht eingeloggt'})

    cursor = mydb.cursor()
    cursor.execute('SELECT * FROM benutzer')

    result = cursor.fetchall()
    cursor.close()

    users = []

    for user in result:
        userObject = {
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'number': user[3],
            'isAdmin': user[4]
        }

        users.append(userObject)

    emit('user-data', users)

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)