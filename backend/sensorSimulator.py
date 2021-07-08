# Dependencies
from __main__ import socketio, app, queryData, mysql
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
            'SensorID': random.randint(1, 3),
            'Temperatur': random.uniform(25.5, 105.5)
        }
    }

    with app.app_context():
        query = queryData('InsertTemperatur', data)

        socketio.emit('added', {
            'name': 'InsertTemperatur',
            'new': query['data'],
            'message': query['message']
        }) 

event = threading.Event()

t = ThreadJob(simulateSensor, event, 30)
t.start()