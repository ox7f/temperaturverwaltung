from flask import Flask, render_template
from flask_socketio import SocketIO, emit
    
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# neuer client
@socketio.on('connect')
def connected():
    emit('table-data', 'connected', broadcast=True)





if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)