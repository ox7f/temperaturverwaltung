from flask import Flask, render_template
from flask_socketio import SocketIO, emit
    
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return 'Hier gibt es nichts zu sehen ;)'

@socketio.on('connected')
def handle_message(data):
    print(data)

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)