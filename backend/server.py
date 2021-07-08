# Dependencies
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_mysqldb import MySQL
from flask_socketio import SocketIO, emit

import MySQLdb

# Webserver in­i­ti­a­li­sie­ren
app = Flask(__name__)

# Konfigurations zeugs
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'temperaturverwaltung'
app.config['SECRET_KEY'] = 'WHKAWSF kleines Geheimnis Zwinkersmiley'
app.config['CORS_HEADERS'] = 'Content-Type'

# DB einbinden
mysql = MySQL(app)

# CORS-Policy (Kommunikation zwischen Port 8080 und 1337 erlauben)
CORS(app)

# Socket in­i­ti­a­li­sie­ren
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080', async_mode='threading')

# routing stuff

# Login Endpunkt
@app.route('/api/login', methods=['POST'])
@cross_origin(origin='localhost')
def login():
    return {'data': queryData('Anmelden', request.json)}

# socket stuff

@socketio.on('get-data')
def getEvent(name):
    print('get-data', name)

    if type(name) == list:
        for event in name:
            query = queryData(event)
            emit('data', {
                'name': event,
                'data': query['data'],
                'message': query['message']
            })
    else:
        query = queryData(name)
        emit('data', {
            'name': name,
            'data': query['data'],
            'message': query['message']
        })

@socketio.on('add-data')
def addEvent(data):
    print('add-data', data)

    query = queryData(data['name'], data)
    print('query add', query)
    emit('added', {
        'name': data['name'],
        'new': query['data'],
        'message': query['message']
    })

@socketio.on('modify-data')
def modifyEvent(data):
    print('modify-data', data)

    query = queryData(data['name'], data)
    print('query modify', query)
    emit('modified', {
        'name': data['name'],
        'data': data['params'],
        'message': query['message']
    })

@socketio.on('remove-data')
def removeEvent(data):
    print('remove-data', data)

    query = queryData(data['name'], data)
    print('query remove', query)
    emit('removed', {
        'name': data['name'],
        'old': data['params'],
        'message': query['message']
    })

#import sensorSimulator

# bastelt Query aus Input
def queryData(name, *args):
    action = name.replace('Temperatur', '').replace('Sensor', '').replace('Hersteller', '').replace('Log', '').replace('Benutzer', '')
    table = name.replace('Select', '').replace('Insert', '').replace('Delete', '').replace('Update', '')

    if action != 'Select':
        args = args[0]['params']

    if action == 'Anmelden':
        query = "SELECT * FROM benutzer WHERE Anmeldename='{v1}' AND Passwort='{v2}'".format(v1=args['Anmeldename'], v2=args['Passwort'])
    elif action == 'Select':
        query = "SELECT * FROM {v1}".format(v1=table)
    elif action == 'Insert':
        if table == 'Temperatur':
            query = "INSERT INTO temperatur (SensorID, Temperatur) VALUES ({v1},{v2})".format(v1=args['SensorID'], v2=args['Temperatur'])
        if table == 'Sensor':
            query = "INSERT INTO sensor (Serverschrank, HerstellerID, MaximalTemperatur, Adresse) VALUES ({v1},{v2},{v3},{v4})".format(v1=args['Serverschrank'], v2=args['HerstellerID'], v3=args['MaximalTemperatur'], v4=args['Adresse'])
        if table == 'Hersteller':
            query = "INSERT INTO hersteller (Name) VALUES ('{v1}')".format(v1=args['Name'])
        if table == 'Benutzer':
            query = "INSERT INTO benutzer (Anmeldename, Telefonnummer, Administrator, Passwort) VALUES ('{v1}','{v2}',{v3},'{v4}')".format(v1=args['Anmeldename'], v2=args['Telefonnummer'], v3=args['Administrator'], v4=args['Passwort'])
        if table == 'Log':
            query = "INSERT INTO log (SensorID, BenutzerID, MaximalTemperatur) VALUES ({v1},{v2},{v3})".format(v1=args['SensorID'], v2=args['BenutzerID'], v3=args['MaximalTemperatur'])
    elif action == 'Update':
        if table == 'Sensor':
            query = "UPDATE sensor SET Serverschrank={v1}, HerstellerID={v2}, MaximalTemperatur={v3}, Adresse='{v4}' WHERE SensorID={v5}".format(v1=args['Serverschrank'], v2=args['HerstellerID'], v3=args['MaximalTemperatur'], v4=args['Adresse'], v5=args['SensorID'])
        if table == 'Hersteller':
            query = "UPDATE hersteller SET Name='{v1}' WHERE HerstellerID={v2}".format(v1=args['Name'], v2=args['HerstellerID'])
        if table == 'Benutzer':
            query = "UPDATE benutzer SET Anmeldename='{v1}', Telefonnummer={v2}, Administrator={v3}, Passwort='{v4}' WHERE BenutzerID={v5}".format(v1=args['Anmeldename'], v2=args['Telefonnummer'], v3=args['Administrator'], v4=args['Passwort'], v5=args['BenutzerID'])
    elif action == 'Delete':
        query = "DELETE FROM {v1} WHERE {v2}={v3}".format(v1=table, v2=table+'ID' ,v3=args[table+'ID'])
    else:
        return 'Error'

    return getResult(query, action, table, args)

# fuehrt Query aus und gibt Wert zurueck
def getResult(query, action, table, args):
    data = args

    cursor = mysql.connection.cursor()

    try:
        cursor.execute(query)
        columns = cursor.description 

        if action == 'Select':
            data = [{columns[index][0]:column for index, column in enumerate(value)} for value in cursor.fetchall()]

            for d in data:
                if 'Zeit' in d:
                    d['Zeit'] = d['Zeit'].__str__()

                if 'Administrator' in d:
                    if d['Administrator'] == b'\x01':
                        d['Administrator'] = True
                    else:
                        d['Administrator'] = False

        elif action == 'Anmelden':
            result = cursor.fetchone()

            n = 0
            for i in cursor.description:
                data[i[0]] = result[n]
                n = n + 1

            if 'Administrator' in data:
                if data['Administrator'] == b'\x01':
                    data['Administrator'] = True
                else:
                    data['Administrator'] = False

        if action == 'Insert':
            data[table+'ID'] = cursor.lastrowid

        mysql.connection.commit()
        message = 'Success'
    except MySQLdb.IntegrityError:
        message = 'Error'
    finally:
        cursor.close()

    logQuery(table, args, data)

    return {'data': data, 'message': message}

def logQuery(table, args, data):
    if table == 'Sensor':
        logCursor = mysql.connection.cursor()
        logCursor.execute("INSERT INTO log (SensorID, BenutzerID) VALUES ({v1},{v2})".format(v1=args['SensorID'], v2=data['BenutzerID']))
        mysql.connection.commit()
        logCursor.close()

# Webserver starten
if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)