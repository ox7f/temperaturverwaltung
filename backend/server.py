# Dependencies
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
from AccessDatabase import ExecuteCommand, IsAdmin, OpenDB

# Webserver in­i­ti­a­li­sie­ren
app = Flask(__name__)
# CORS-Policy (Kommunikation zwischen Port 8080 und 1337 erlauben)
CORS(app)
# Konfigurations zeugs
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
# Socket in­i­ti­a­li­sie­ren
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080', async_mode='threading')

# routing stuff

# Login Endpunkt
@app.route('/api/login', methods=['POST'])
@cross_origin(origin = 'localhost')
def login():
    print('login try?')
    # return User oder {}
    return {'data': ExecuteCommand("LIS1","",request.json)}

# socket stuff

@socketio.on('get-data')
def getEvent(data):
    # data.name => SelectTemperatur/SelectBenutzer/SelectLog/SelectSensor/(SelectHersteller)
    # data.params => queryName sensor+hersteller, nur temperaturen usw.
    emit('data', {'data': ExecuteCommand(data.name, 'User', '')})

@socketio.on('add-data')
def addEvent(data):
    # data.name => InsertTemperatur/InsertBenutzer/InsertLog/InsertSensor/(InsertHersteller)
    # data.params => benutzer/sensor/log, element halt.
    emit('added', {'message': ExecuteCommand(data.name, 'User', data.params), 'data': data})

@socketio.on('modify-date')
def modifyEvent(data):
    # data.name => UpdateTemperatur/UpdateBenutzer/UpdateLog/UpdateSensor/(UpdateHersteller)
    emit('changed', {'message': ExecuteCommand(data.name, 'User', data.params), 'data': data})

@socketio.on('remove-data')
def removeEvent(data):
    # data.name => DeleteTemperatur/DeleteBenutzer/DeleteLog/DeleteSensor/(DeleteHersteller)
    emit('removed', {'message': ExecuteCommand(data.name, 'User', data.params), 'data': data})

import sensorSimulator

if __name__ == '__main__':
    # Webserver starten
    socketio.run(app, port=1337, debug=True)