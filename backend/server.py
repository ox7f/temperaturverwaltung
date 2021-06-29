from flask import Flask, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080')

# socket stuff

# client ruft website auf
@socketio.on('connect')
def connect():
    # user bereits eingeloggt?
    if session and session['logged_in']:
        # eingeloggten user mit daten versorgen
        getData()
        getUsers()

# client bestaetigt login
@socketio.on('login')
def login(data):
    if not data['name']:
        return emit('login-error', {'message': 'no username defined'})

    if not data['password']:
        return emit('login-error', {'message': 'no password defined'})

    # todo: daniel - einbindung dict.py
    data = 'todo'
    emit('login-success', {'message': 'success', 'data': data})

# client loggt sich aus
@socketio.on('logout')
def logout():
    session.pop('is_admin', None)
    session.pop('logged_in', None)

@socketio.on('add-temperature')
def addTemperature(data):
    if not session['logged_in']:
        emit('login-error', {'message': 'you need to be logged in!'})
        return

    if (session['is_admin'] == 0):
        emit('login-error', {'message': 'unauthorized access'})
        return

    # todo: daniel - einbindung dict.py
    emit('temperature-added', {'message': 'success', 'data': data})

@socketio.on('remove-temperature')
def removeTemperature(data):
    if not session['logged_in']:
        emit('login-error', {'message': 'you need to be logged in!'})
        return

    if (session['is_admin'] == 0):
        emit('login-error', {'message': 'unauthorized access'})
        return

    emit('temperature-removed', {'message': 'success', 'data': data})

@socketio.on('get-data')
def getData():
    if not session['logged_in']:
        emit('login-error', {'message': 'you need to be logged in!'})
        return

    # todo: daniel - einbindung dict.py
    data = 'todo'
    emit('data', {'message': 'success', 'data': data})

@socketio.on('get-users')
def getUsers():
    if not session['logged_in']:
        emit('login-error', {'message': 'you need to be logged in!'})
        return

    # todo: daniel - einbindung dict.py
    data = 'todo'
    emit('users',  {'message': 'success', 'data': data})

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)