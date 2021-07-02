# todo: simulate sensor

from __main__ import socketio, app
import sched, time
import functools

s = sched.scheduler(time.time, time.sleep)

def setInterval(sec):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*argv, **kw):
            setInterval(sec)(func)
            func(*argv, **kw)
        s.enter(sec, 1, wrapper, ())
        return wrapper
    s.run()
    return decorator

@setInterval(sec=5)
def simulateSensor():
    print('simulate sensor')

    with app.app_context():
        socketio.emit('new-temperatur', {'message': 'message', 'data': 'test'})

#simulateSensor()