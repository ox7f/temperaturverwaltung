import mysql.connector
import json

def OpenDB():
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="temperaturverwaltung"
    )
    return db

def GetCommand(program):
    with open("query.json", "r") as json_file:
        commands = json.load(json_file)
        commands = json.loads(commands)
    return commands.get(program,"ERROR")

def IsAdmin(db, user):
    return QueryTable(db,GetCommand("LIS3").format(p1 = user))

def MaxTempChanged(db, placeholder):
    Changed = False
    try:
        cursor = db.cursor()
        cursor.execute(GetCommand("7cS2").format(p1 = placeholder[1]))
        for x in cursor.fetchone():
            Changed = (str(x) != placeholder[5])
        cursor.close()
        return Changed
    except Exception as e:
        return False

def SetPlaceholder(program, input_dict):
    placeholder = [program,"","","","",""]
    i = 0
    for x in input_dict:
        i = i + 1
        placeholder[i] = input_dict[x]
    return placeholder

def FillPlaceholder(command, placeholder):
    return command.format(p1 = placeholder[1],p2 = placeholder[2],p3 = placeholder[3],p4 = placeholder[4],p5 = placeholder[5])

def QueryTable(db, command):
    query = {}
    row = {}
    i = 0

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
            row = {}
            i = i + 1
        cursor.close()
        return query
    except Exception as e:
        return "ERROR: " + str(e)

def ModifyData(db, command):   
    try:
        cursor = db.cursor()
        cursor.execute(command)
        cursor.close()
        return "Success"
    except Exception as e:
        return "ERROR: " + str(e)
   
def ExecuteCommandWithLog(db, placeholder, user):
    user = QueryTable(db, GetCommand("LIS2").format(p1 = user))[0]["BenutzerID"]
    Changed = MaxTempChanged(db,placeholder)
    if placeholder[0] == "7cU":
        modify_result = ModifyData(db,FillPlaceholder(GetCommand(placeholder[0]),placeholder))
        if modify_result == "Success":
            if Changed:
                modify_result = ModifyData(db,GetCommand("InsertLog",placeholder).format(p1 = placeholder[1], p4 = placeholder[2], p3 = user))
                if modify_result == "Success":
                    db.commit()
                    return QueryTable(db,GetCommand("7cS"))
            else:
                db.commit()
                return QueryTable(db,GetCommand("7cS"))
        return modify_result

    if placeholder[0] == "InsertSensor":
        modify_result = ModifyData(db,FillPlaceholder(GetCommand(placeholder[0]),placeholder))
        if modify_result == "Success":
            modify_result = ModifyData(db,FillPlaceholder(GetCommand("InsertLog").format(p3 = user),placeholder))
            if modify_result == "Success":
                db.commit()
                return QueryTable(db,GetCommand("SelectSensor"))
        return modify_result

    if placeholder[0] == "UpdateSensor":

        Changed = MaxTempChanged(db,placeholder)
        modify_result = ModifyData(db,FillPlaceholder(GetCommand(placeholder[0]),placeholder))
        if modify_result == "Success":
            if Changed:
                modify_result = ModifyData(db,FillPlaceholder(GetCommand("InsertLog").format(p3 = user),placeholder))
                if modify_result == "Success":
                    db.commit()
                    return QueryTable(db,GetCommand("SelectSensor"))
            else:
                db.commit()
                return QueryTable(db,GetCommand("SelectSensor"))
        return modify_result

    if placeholder[0] == "DeleteSensor":
        modify_result = ModifyData(db,FillPlaceholder(GetCommand("InsertLog").format(p3 = user),placeholder))
        if modify_result == "Success":
            modify_result = ModifyData(db,FillPlaceholder(GetCommand(placeholder[0]),placeholder))
            if modify_result == "Success":
                db.commit()
                return QueryTable(db,GetCommand("SelectSensor"))
        return modify_result

def ExecuteCommand(program, user, data):
    db = OpenDB()
    placeholder = SetPlaceholder(program,data)
    command = FillPlaceholder(GetCommand(program), placeholder)
    if command != "ERROR":
        if ((program[2] == "S") or (program[0:6] == "Select")):
            if program == "SelectBenutzer":
                if IsAdmin(db,user):
                    return QueryTable(db,command)
                else:
                    return "ERROR: Sie benötigen Adminrechte um auf die Benutzer zugreifen zu können."
            else:
                return QueryTable(db,command)
        else:
            if IsAdmin(db,user):
                if  program in ["7cU","InsertSensor","UpdateSensor","DeleteSensor"]:
                    return ExecuteCommandWithLog(db,placeholder)
                else:
                    modify_result = ModifyData(db,command)
                    if modify_result == "Success":
                        db.commit()
                    return modify_result
            else:
                return "ERROR: Zum ändern von Daten benötigen sie Adminrechte."
    else:
        return "ERROR: Programmierfehler"

# Einfügen von Sensoren
# "7eI" : "INSERT INTO sensor (Serverschrank, MaximalTemperatur, Adresse, HerstellerID) VALUES ({p1}, {p2}, '{p3}', {p4})"
# "7bI" : "INSERT INTO log (Zeit, SensorID, BenutzerID, MaximalTemperatur) VALUES ("DateTime", {p1}, "Session.User", {p2});"
# "7eS" : "SELECT * FROM sensor"

# Ändern von Sensorendaten
# "7eU" : "UPDATE sensor SET Serverschrank = {p1}, MaximalTemperatur = {p2}, Adresse = '{p3}', HerstellerID = {p4} WHERE SensorID = {p5};"
# "7cS2" : "SELECT MaximalTemperatur FROM log WHERE SensorID = {p1};"
# "7bI" : "INSERT INTO log (Zeit, SensorID, BenutzerID, MaximalTemperatur) VALUES ("DateTime", {p1}, "Session.User", {p2});"
# "7eS" : "SELECT * FROM sensor",

# "7cU" : "UPDATE sensor SET MaximalTemperatur = {p2} WHERE SensorID = {p1};"
# "7bI" : "INSERT INTO log (Zeit, SensorID, BenutzerID) VALUES ("DateTime", {p1}, "Session.User");"
# "7cS" : "SELECT SensorID, MaximalTemperatur FROM sensor;"

# Löschen von Sensoren
# "7bI" : "INSERT INTO log (Zeit, SensorID, BenutzerID, MaximalTemperatur) VALUES ("DateTime", {p1}, "Session.User", 0);"
# "7eD" : "DELETE FROM sensor WHERE SensorID = {p1};"
# "7eS" : "SELECT * FROM sensor;"