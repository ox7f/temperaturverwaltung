from flask import Flask, session, jsonify, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
import mysql.connector

app = Flask(__name__)
cors = CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF hat ganz dicke Eier'
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

    sql = 'SELECT `Administrator` FROM benutzer WHERE Anmeldename = %s AND Passwort = %s'
    val = (data['name'], data['password'])

    logincursor.execute(sql, val)
    userResult = logincursor.fetchone()
    logincursor.close()

    if (userResult):
        session['logged_in'] = True
        status = userResult[0]

    response = {
        'status': status,
        'isAdmin': userResult[0],
    }

    return jsonify(response)

@app.route('/api/logout', methods=['GET', 'POST'])
@cross_origin()
def logout():
    session.pop('logged_in', None)
    return jsonify({'message': 'success'})

@app.route('/api/addTemperatur', methods=['GET', 'POST'])
@cross_origin()
def addTemperature():
    print(request)

    #addcursor = mydb.cursor()

    #sql = 'INSERT INTO temperatur (SensorID, Temperatur) VALUES (%s, %s)'
    #val = (1, 20.5)

    #addcursor.execute(sql, val)
    #mydb.commit()
    #addcursor.close()

    emit('temperature-added', 'todo: table data aus der datenbank')

    message = 'todo: success oder error'
    return message

@app.route('/api/removeTemperature', methods=['GET', 'POST'])
@cross_origin()
def removeTemperature():
    print(request)
    emit('temperature-removed', 'todo: table data aus der datenbank')
    message = 'todo: success oder error'
    return message

# socket stuff
@socketio.on('connect')
def connected():
    emit('table-data', 'todo: table data aus der datenbank')

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)