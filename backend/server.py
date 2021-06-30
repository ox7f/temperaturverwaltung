from flask import Flask, session
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080')

# routing stuff

@app.route('/api/login', methods=['POST'])
@cross_origin(origin = 'localhost')
def login():
    session['logged_in'] = 'user existiert in db => true';
    session['user'] = 'aus db';
    session['isAdmin'] = 'aus db';
    return {'message': 'success', 'token': 'todo: session token'}

@app.route('/api/logout', methods=['POST'])
@cross_origin(origin = 'localhost')
def logout():
    session.pop('logged_in', None)
    session.pop('user', None)
    session.pop('isAdmin', None)

# socket stuff

# client ruft website auf
@socketio.on('connect')
def connect():
    # user bereits eingeloggt?
    if session and session['logged_in']:
        # eingeloggten user mit daten versorgen
        getData()
        getUsers()

@socketio.on('add-temperature')
def addTemperature(data):
    if not session['logged_in']:
        send('login-error', {'message': 'you need to be logged in!'})
        return

    if (session['is_admin'] == 0):
        send('login-error', {'message': 'unauthorized access'})
        return

    # todo: daniel - einbindung dict.py
    emit('temperature-added', {'message': 'success', 'data': data})

@socketio.on('remove-temperature')
def removeTemperature(data):
    if not session['logged_in']:
        send('login-error', {'message': 'you need to be logged in!'})
        return

    if (session['is_admin'] == 0):
        send('login-error', {'message': 'unauthorized access'})
        return

    emit('temperature-removed', {'message': 'success', 'data': data})

@socketio.on('get-data')
def getData():
    if not session['logged_in']:
        send('login-error', {'message': 'you need to be logged in!'})
        return

    # todo: daniel - einbindung dict.py
    data = 'todo'
    send('data', {'message': 'success', 'data': data})

@socketio.on('get-users')
def getUsers():
    if not session['logged_in']:
        send('login-error', {'message': 'you need to be logged in!'})
        return

    # todo: daniel - einbindung dict.py
    data = 'todo'
    send('users',  {'message': 'success', 'data': data})

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)