from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit, send
from AccessDatabase import ExecuteCommand, IsAdmin, OpenDB

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080')

# routing stuff

@app.route('/api/login', methods=['POST'])
@cross_origin(origin = 'localhost')
def login():
    return {'data': ExecuteCommand("LIS1","",request.json)}

# socket stuff

@socketio.on('add-user')
def addUser(data):
    emit('user-added', {'message': 'success', 'data': ExecuteCommand("InsertBenutzer","User",data)})

@socketio.on('change-sensor')
def changeSensor(data):
    data = ExecuteCommand("UpdateSensor","User",data)
    emit('sensor-changed', {'message': 'success', 'data': data})

@socketio.on('remove-temperature')
def removeTemperature(data):
    data = ExecuteCommand("DeleteTemperatur","User",data)
    emit('temperature-removed', {'message': 'success', 'data': data})

@socketio.on('remove-user')
def removeUser(data):
    data = ExecuteCommand("DeleteBenutzer","User",data)
    emit('user-removed', {'message': 'success', 'data': data})

@socketio.on('remove-sensor')
def removeSensor(data):
    data = ExecuteCommand("DeleteSensor","User",data)
    emit('sensor-removed', {'message': 'success', 'data': data})

@socketio.on('get-data')
def getData(data):
    print(data)

    data = ExecuteCommand(data,"User","")
    emit('data', {'message': 'success', 'data': data})

@socketio.on('get-users')
def getUsers():
    data = ExecuteCommand("SelectBenutzer","User","")

    emit('users',  {'message': 'success', 'data': data})

import sensorSimulator

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)