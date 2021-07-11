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

# CORS einbinden
CORS(app)

# Socket in­i­ti­a­li­sie­ren
socketio = SocketIO(app, cors_allowed_origins='http://localhost:8080', async_mode='threading')

# routing stuff

# Login Endpunkt
@app.route('/api/login', methods=['POST'])
@cross_origin(origin='localhost')
def login():
    query = queryData('Anmelden', request.json)
    return {'data': query['data'], 'message': query['message']}

# socket stuff

@socketio.on('get-data')
def getEvent(name):
    for event in name:
        query = queryData(event)
        emit('data', {
            'name': event,
            'data': query['data'],
            'message': query['message']
        })

@socketio.on('add-data')
def addEvent(data):
    query = queryData(data['name'], data)
    emit('added', {
        'name': data['name'],
        'new': query['data'],
        'message': query['message']
    })

@socketio.on('modify-data')
def modifyEvent(data):
    query = queryData(data['name'], data)
    emit('modified', {
        'name': data['name'],
        'data': data['params'],
        'message': query['message']
    })

@socketio.on('remove-data')
def removeEvent(data):
    query = queryData(data['name'], data)
    emit('removed', {
        'name': data['name'],
        'old': data['params'],
        'message': query['message']
    })

# bastelt Query aus Input
def queryData(name, *args):
    action = name.replace('Temperatur', '').replace('Sensor', '').replace('Hersteller', '').replace('Log', '').replace('Benutzer', '')
    table = name.replace('Select', '').replace('Insert', '').replace('Delete', '').replace('Update', '')

    if action != 'Select':
        if name == 'Anmelden':
            args = args[0]
        elif name == 'Simulator':
            args = args[0]
        else:
            args = args[0]['params']

    if action == 'Anmelden':
        query = "SELECT * FROM benutzer WHERE Anmeldename='{v1}' AND Passwort='{v2}'".format(v1=args['Anmeldename'], v2=args['Passwort'])
    elif action == 'Select':
        query = "SELECT * FROM {v1}".format(v1=table.lower())
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
            logQuery(table, action, args)
        if table == 'Hersteller':
            query = "UPDATE hersteller SET Name='{v1}' WHERE HerstellerID={v2}".format(v1=args['Name'], v2=args['HerstellerID'])
        if table == 'Benutzer':
            query = "UPDATE benutzer SET Anmeldename='{v1}', Telefonnummer={v2}, Administrator={v3}, Passwort='{v4}' WHERE BenutzerID={v5}".format(v1=args['Anmeldename'], v2=args['Telefonnummer'], v3=args['Administrator'], v4=args['Passwort'], v5=args['BenutzerID'])
    elif action == 'Delete':
        query = "DELETE FROM {v1} WHERE {v2}={v3}".format(v1=table.lower(), v2=table+'ID' ,v3=args[table+'ID'])

        if table == 'Sensor':
            logQuery(table, action, args)
    elif name == 'Simulator':
        query = "SELECT * FROM temperatur WHERE TemperaturID={v1}".format(v1=args['TemperaturID'])
    else:
        return 'Error'

    return getResult(query, action, table, args)

# fuehrt Query aus und gibt Wert zurueck
def getResult(query, action, table, args):
    data = args
    cursor = mysql.connection.cursor()

    try:
        cursor.execute(query)

        if action == 'Select' or action == 'Anmelden' or action == 'Simulator':
            columns = cursor.description
            data = [{columns[index][0]:column for index, column in enumerate(value)} for value in cursor.fetchall()]

            for d in data:
                if 'Zeit' in d:
                    d['Zeit'] = d['Zeit'].__str__()

                if 'Administrator' in d:
                    if d['Administrator'] == b'\x01':
                        d['Administrator'] = True
                    else:
                        d['Administrator'] = False

        if not data:
            return {'message': 'Error', 'data': []}

        if action == 'Anmelden':
            data = data[0]

        mysql.connection.commit()
        message = 'Success'
    except MySQLdb.IntegrityError:
        message = 'Error'
    finally:
        cursor.close()

    if action == 'Insert':
        data[table+'ID'] = cursor.lastrowid
        if table == 'Sensor':
            logQuery(table, action, data)

    return {'data': data, 'message': message}

def logQuery(table, action, args):
    if table == 'Sensor' and action != 'Select':
        logCursor = mysql.connection.cursor()

        try:
            logCursor.execute("INSERT INTO log (SensorID, BenutzerID, Info) VALUES ({v1},{v2},'{v3}')".format(v1=args['SensorID'], v2=args['UserID'], v3=action+table))
            mysql.connection.commit()
            message = 'Success'
        except MySQLdb.IntegrityError:
            message = 'Error'
        finally:
            logCursor.close()

        data = {
            'LogID': logCursor.lastrowid,
            'SensorID': args['SensorID'],
            'BenutzerID': args['UserID'],
            'Info': action + table
        }

        emit('added', {
            'name': 'InsertLog',
            'new': data,
            'message': message
        }) 

import sensorSimulator

# Webserver starten
if __name__ == '__main__':
    socketio.run(app, port=1337, debug=True)