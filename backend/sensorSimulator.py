# Dependencies
from __main__ import socketio, app, ExecuteCommand, getLatest
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
        socketio.emit('added', {
            'name': name,
            'new': getLatest(name),
            'message': message
        }) 

event = threading.Event()

t = ThreadJob(simulateSensor, event, 30)
t.start()