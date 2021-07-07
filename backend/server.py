# Dependencies
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit

from AccessDatabase import ExecuteCommand, OpenDB

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
@cross_origin(origin='localhost')
def login():
    return {'data': ExecuteCommand('LIS1', '', request.json)}

# socket stuff

@socketio.on('get-data')
def getEvent(data):
    print('get-data', data)

    if type(data) == list:
        for event in data:
            emit('data', {
                'name': event,
                'data': ExecuteCommand(event, 'User', '')
            })
    else:
        emit('data', {
            'name': data,
            'data': ExecuteCommand(data, 'User', '')
        })

@socketio.on('add-data')
def addEvent(data):
    print('add-data', data)

    # TODO - neues element aus db ziehen => zurückballern

    emit('added', {
        'name': data['name'],
        'new': data['params'],
        'message': ExecuteCommand(data['name'], data['params']['benutzer'], data['params'])
    })

@socketio.on('modify-data')
def modifyEvent(data):
    print('modify-data', data)

    # TODO: new hat ja alles sensoren und nicht nur den einen modifizierten
    emit('modified', {
        'name': data['name'],
        'old': data['params'],
        'new': ExecuteCommand(data['name'], data['params']['benutzer'], data['params']),
        'message': 'Success'
    })

@socketio.on('remove-data')
def removeEvent(data):
    print('remove-data', data)

    emit('removed', {
        'name': data['name'],
        'old': data['params'],
        'message': ExecuteCommand(data['name'], data['params']['benutzer'], data['params'])
    })

import sensorSimulator

if __name__ == '__main__':
    # Webserver starten
    socketio.run(app, port=1337, debug=True)