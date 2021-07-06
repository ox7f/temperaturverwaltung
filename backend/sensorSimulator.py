# Dependencies
from __main__ import socketio, app, ExecuteCommand
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
    data = {
        'name': 'InsertTemperatur',
        'params': {
            'TemperaturID': 0,
            'Zeit': 0,
            'SensorID': random.randint(1, 3),
            'Temperatur': random.uniform(25.5, 105.5)
        }
    }

    print(data)

    with app.app_context():
        socketio.emit('added', {
            'name': data['name'],
            'new': data['params'],
            'message': ExecuteCommand(data['name'], 'User', data['params'])
        })

event = threading.Event()

t = ThreadJob(simulateSensor, event, 3600)
t.start()