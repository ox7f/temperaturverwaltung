# Dependencies
from __main__ import socketio, app, ExecuteCommand, OpenDB
import threading
import random

class ThreadJob(threading.Thread):
    def __init__(self,callback,event,interval):
        self.callback = callback
        self.event = event
        self.interval = interval
        super(ThreadJob,self).__init__()

    def run(self):
        while not self.event.wait(self.interval):
            self.callback()

def simulateSensor():

    name = 'InsertTemperatur'
    data = {
        'name': name,
        'params': {
            'TemperaturID': 0,
            'Zeit': 0,
            'SensorID': random.randint(1, 3),
            'Temperatur': random.uniform(25.5, 105.5)
        }
    }
    message = ExecuteCommand(data['name'], 'User', data['params'])

    with app.app_context():
        db = OpenDB()

        cursor = db.cursor()
        cursor.execute('SELECT * FROM temperatur ORDER BY TemperaturID DESC LIMIT 1')
        data = cursor.fetchone()

        cursor.close()

        new = {
            'TemperaturID': data[0],
            'Zeit': data[1].__str__(),
            'SensorID': data[2],
            'Temperatur': data[3]
        }

        socketio.emit('added', {
            'name': name,
            'new': new,
            'message': message
        }) 

event = threading.Event()

t = ThreadJob(simulateSensor, event, 30)
t.start()