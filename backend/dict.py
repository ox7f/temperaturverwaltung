import mysql.connector
import json

def GetCommand(programm):
    commands = {"6aS" : "SELECT * FROM temperatur;",
                "6bS" : "SELECT sensor.SensorID, sensor.Serverschrank, sensor.MaximalTemperatur, sensor.Adresse, hersteller.HerstellerID, hersteller.Name FROM sensor JOIN hersteller ON sensor.HerstellerID = hersteller.HerstellerID;",
                "6cS" : "SELECT sensor.SensorID, sensor.Serverschrank, sensor.MaximalTemperatur, sensor.Adresse, sensor.HerstellerID, temperatur.TemperaturID, temperatur.Zeit, temperatur.Temperatur FROM sensor LEFT JOIN temperatur ON sensor.SensorID = temperatur.SensorID;",
                "6dS" : "SELECT temperatur.TemperaturID, temperatur.Zeit, temperatur.Temperatur, sensor.SensorID, sensor.Serverschrank, sensor.MaximalTemperatur, sensor.Adresse, hersteller.HerstellerID, hersteller.Name FROM temperatur LEFT JOIN sensor ON sensor.SensorID = temperatur.SensorID LEFT JOIN hersteller ON sensor.HerstellerID = Hersteller.HerstellerID;",
                "6eS" : "SELECT * FROM temperatur WHERE TemperaturID > (SELECT COUNT(*) FROM temperatur) - 10;",
                "6fS" : "SELECT * FROM temperatur ORDER BY TemperaturID DESC LIMIT 10;",
                "6gS" : "SELECT sensor.SensorID, sensor.Serverschrank, sensor.MaximalTemperatur, sensor.Adresse, sensor.HerstellerID, temperatur.TemperaturID, temperatur.Zeit, MAX(temperatur.Temperatur) FROM sensor LEFT JOIN temperatur ON sensor.SensorID = temperatur.SensorID GROUP BY sensor.SensorID;",
                "6hS" : "SELECT sensor.SensorID, sensor.Serverschrank, sensor.MaximalTemperatur, sensor.Adresse, sensor.HerstellerID, temperatur.TemperaturID, temperatur.Zeit, AVG(temperatur.Temperatur) FROM sensor LEFT JOIN temperatur ON sensor.SensorID = temperatur.SensorID GROUP BY sensor.SensorID;",
                "7aS" : "SELECT * FROM benutzer;",
                "7aI" : "INSERT INTO benutzer (BenutzerID, Anmeldename, Telefonnummer) VALUES ({p1}, '{p2}', '{p3}');",
                "7bS" : "SELECT * FROM log;",
                "7bI" : "INSERT INTO log (Zeit, LogID, SensorID, BenutzerID) VALUES ({p1}, {p2}, {p3}, {p4});",
                "7cS" : "SELECT SensorID, MaximalTemperatur FROM sensor;",
                "7cI" : "INSERT INTO log (Zeit, LogID, SensorID, BenutzerID) VALUES ({p1}, {p2}, {p3}, {p4});",
                "7dS" : "SELECT * FROM temperatur",
                "7dD" : "DELETE FROM temperatur WHERE TemperaturID = {p1};",
                "7eS" : "SELECT * FROM sensor",
                "7eU" : "UPDATE sensor SET Serverschrank = {p1}, MaximalTemperatur = {p2}, Adresse = '{p3}', HerstellerID = {p4} WHERE SensorID = {p5};",
                "7eD" : "DELETE FROM sensor WHERE SensorID = {p1};",
                "LIS" : "SELECT COUNT(*) FROM benutzer WHERE Anmeldename = '{p1}' AND Passwort = '{p2}'"}
    return commands.get(programm,"ERROR")

def GetPlaceholder():
    with open("placeholder.json", "r") as json_file:
        placeholder = json.load(json_file)
        placeholder = json.loads(placeholder)
        return placeholder

def FillPlaceholder(command, placeholder):    
        return command.format(p1 = placeholder[1],p2 = placeholder[2],p3 = placeholder[3],p4 = placeholder[4],p5 = placeholder[5])

def QueryTable(command):
    query = {}
    row = {}
    i = 0

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="temperaturverwaltung"
    )

    try:
        cursor = db.cursor()
        cursor.execute(command)
        fieldnum = len(cursor.description)
        names = [x[0] for x in cursor.description]
        entries = cursor.fetchall()
        for x in entries:
            for j in range(0,fieldnum):
                row[names[j]] = str(x[j])
            query[i] = row
            i = i + 1

        with open("query.json", "w") as json_file:
            data = json.dumps(query)
            json.dump(data, json_file)
        cursor.close()
    except Exception as e:
        print(e)

    db.close()

def ModifyData(command):   
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="temperaturverwaltung"
    )

    try:
        cursor = db.cursor()
        cursor.execute(FillPlaceholder(command))
        db.commit()
        cursor.close()
    except Exception as e:
        print(e)
   
    db.close()

def ExecuteCommand():
    placeholder = GetPlaceholder()
    command_string = placeholder[0]
    command = GetCommand(command_string)  
    if command != "ERROR":
        if command_string[2] == "S":
            if command_string == "LIS":
                command = FillPlaceholder(command, placeholder)
            QueryTable(command)
        else:
            ModifyData(command)
            ExecuteCommand(command_string[0:2] + "S")

ExecuteCommand()