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
    placeholder = [program,"","","","","","","",""]
    i = 0
    for x in input_dict:
            i = i + 1
            placeholder[i] = input_dict[x]
    return placeholder

def FillPlaceholder(command, placeholder):
    return command.format(p1 = placeholder[1],p2 = placeholder[2],p3 = placeholder[3],p4 = placeholder[4],p5 = placeholder[5])
   
def ModifyDataWithLog(db, placeholder, user):
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

def ExecuteCommand(program, user, data):
    db = OpenDB()
    placeholder = SetPlaceholder(program,data)
    command = FillPlaceholder(GetCommand(program), placeholder)
    if command != "ERROR":
        if ((program[2] == "S") or (program[0:6] == "Select")):
            if program in ["SelectBenutzer","SelectLog"]:
                if IsAdmin(db,user):
                    return QueryTable(db,command)
                else:
                    return "ERROR: Sie benötigen Adminrechte um auf die Benutzer zugreifen zu können."
            else:
                return QueryTable(db,command)
        else:
            if IsAdmin(db,user):
                if  program in ["7cU","InsertSensor","UpdateSensor"]:
                    return ModifyDataWithLog(db,placeholder)
                else:
                    modify_result = ModifyData(db,command)
                    if modify_result == "Success":
                        db.commit()
                    return modify_result
            else:
                return "ERROR: Zum ändern von Daten benötigen sie Adminrechte."
    else:
        return "ERROR: Programmierfehler"