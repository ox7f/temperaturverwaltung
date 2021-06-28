from flask import Flask, session, jsonify, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
import mysql.connector

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='*')

# routing stuff
@app.route('/api/login', methods=['POST'])
@cross_origin(origin='*')
def login():
    data = request.json

    if not data['user']:
        return jsonify({'message': 'Keine Anmeldename definiert'})

    if not data['password']:
        return jsonify({'message': 'Keine Passwort definiert'})

    # todo: daniel - einbindung dict.py
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

    # todo: daniel - einbindung dict.py
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

    # todo: daniel - einbindung dict.py
    emit('table-data', 'return value of dict.py')

@socketio.on('get-users')
def getUsers():
    if not session['logged_in']:
        return jsonify({'message': 'Nicht eingeloggt'})

    # todo: daniel - einbindung dict.py
    emit('user-data', 'return value of dict.py')

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)