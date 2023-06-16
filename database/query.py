import pathlib
import sqlite3
from flask import request
from datetime import datetime


gt_ext = "zip"

def init_database():
    dbPath = pathlib.Path("output/submits")
    conn = sqlite3.connect(dbPath)
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS submission(id integer primary key autoincrement, title varchar(50), sumbit_date varchar(12),results TEXT)""")
    conn.commit()

    cursor.execute('SELECT id,title,sumbit_date,results FROM submission')
    conn.close()

def get_all_submissions():
    dbPath = pathlib.Path("output/submits")
    conn = sqlite3.connect(dbPath)
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS submission(id integer primary key autoincrement, title varchar(50), sumbit_date varchar(12),results TEXT)""")
    conn.commit()

    cursor.execute('SELECT id,title,sumbit_date,results FROM submission')
    sumbData = cursor.fetchall()
    conn.close()
    return sumbData



def get_submission(method_id: str):
    dbPath = pathlib.Path("output/submits")
    conn = sqlite3.connect(dbPath)
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS submission(id integer primary key autoincrement, title varchar(50), sumbit_date varchar(12),results TEXT)""")
    conn.commit()
    
    cursor.execute('SELECT id,title,sumbit_date,results FROM submission WHERE id=?',(method_id,))
    sumbData = cursor.fetchone()
    conn.close()
    
    return sumbData

def edit_submission(method_id: str, method_name: str):

    
    dbPath = pathlib.Path("output/submits")
    conn = sqlite3.connect(dbPath)
    cursor = conn.cursor()
    cursor.execute('UPDATE submission SET title=? WHERE id=?',(method_name,method_id))
    conn.commit()
    conn.close()    

def delete_submission(method_id: str):
    dbPath = pathlib.Path("output/submits")
    conn = sqlite3.connect(dbPath)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM submission WHERE id=?',(method_id,))
    conn.commit()
    conn.close()

def add_submission(method_result, p):
    dbPath = pathlib.Path("output/submits")
    conn = sqlite3.connect(dbPath)
    cursor = conn.cursor()
    
    if 'title' in request.form.keys():
        submTitle = request.form['title']
    if submTitle=="":
        submTitle = "unnamed"
        
    cursor.execute('INSERT INTO submission(title,sumbit_date,results) VALUES(?,?,?)',(submTitle ,datetime.now().strftime("%Y-%m-%d %H:%M"),method_result))
    conn.commit()
    id = cursor.lastrowid

    os.rename(p['s'], p['s'].replace("subm." + gt_ext,"subm_" + str(id) + "." + gt_ext) )
    os.rename(p['o'] + "/results_{}.zip".format(p['save_name']), p['o'] + "/results_" + str(id) + ".zip" )

    conn.close()