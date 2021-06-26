from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import mysql.connector

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# todo: datenbank anbindung
mydb = mysql.connector.connect(
    host='localhost',
    user='root',
    password=''
)

print(mydb)

# neuer client
@socketio.on('connect')
def connected():
    emit('table-data', 'todo: table data aus der datenbank')

if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)