from flask import Flask
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080')

# routing stuff

@app.route('/api/login', methods=['POST'])
@cross_origin(origin = 'localhost')
def login():
    # irgendein sicheres token generieren (jwt?)
    return {'message': 'success', 'token': 'todo: session token'}

# socket stuff

@socketio.on('add-temperature')
def addTemperature(data):
    # todo: daniel - einbindung dict.py
    data = 'todo'
    emit('temperature-added', {'message': 'success', 'data': data})

@socketio.on('remove-temperature')
def removeTemperature(data):
    # todo: daniel - einbindung dict.py
    data = 'todo'
    emit('temperature-removed', {'message': 'success', 'data': data})

@socketio.on('get-data')
def getData(data):
    print(data)

    # todo: daniel - einbindung dict.py
    data = 'todo'
    emit('data', {'message': 'success', 'data': data})

@socketio.on('get-users')
def getUsers():
    # todo: daniel - einbindung dict.py
    data = 'todo'
    emit('users',  {'message': 'success', 'data': data})

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)