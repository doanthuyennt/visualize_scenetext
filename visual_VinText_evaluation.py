from flask import Flask,flash, render_template, Response, request, session, redirect
from flask import send_from_directory

from flask_apscheduler import APScheduler



import os,sys
import zipfile,json,math
from datetime import datetime


sys.path.append('./')


import importlib
import sqlite3
import rrc_evaluation_funcs

from termcolor import colored
from config.config import *
evaluation_script = 'script_update'
from script_update import evaluate_method
from arg_parser import PARAMS

from PIL import Image

from routes.image_route import image_blueprint
from routes.sample_route import sample_blueprint

from utils.utils import image_name_to_id, get_samples, get_sample_id_from_num, num_samples, samples_list

from database.query import add_submission, edit_submission, init_database, get_submission, get_all_submissions, delete_submission

app = Flask(__name__)
app.secret_key = "secret key"
app.register_blueprint(
    image_blueprint
)
app.register_blueprint(
    sample_blueprint
)

init_database()


imagesFilePath = os.path.join(".","gt","images.zip")
archive = zipfile.ZipFile(imagesFilePath,'r')
L = archive.namelist()
L.sort(key = lambda x: x.split('_')[1].split('.')[0].zfill(4))


@app.route('/',methods=["GET","POST"])
def index():
    
    # _,images_list = num_samples, samples_list

    page = 1
    if 'p' in request.args:
        page = int(request.args['p'])
        
    subm_data = get_all_submissions()
    subm_data = { id : [
        subm_data[id][0],
        subm_data[id][1],
        subm_data[id][2],
        subm_data[id][3]
        ]
        for id in range(len(subm_data))
    }
    vars = {
            'acronym':acronym, 
            'title':title,
            'images':samples_list,
            'method_params':method_params,
            'page':page,
            'subm_data':subm_data,
            'sample_params':sample_params,
            'submit_params':submit_params,
            'instructions':instructions,
            'extension':gt_ext
            }
    return render_template('index.html',vars=vars)

@app.route('/evaluate', methods=['POST','GET'])
def evaluate():
    id=0
    submFile = request.files.get('submissionFile')
    if submFile is None:
        resDict = {"calculated":False,"Message":"No file selected"}
        if request.args['json']=="1":
            return json.dumps(resDict,indent=4)
        else:        
            vars = {
                # 'url':url, 
            'title':'Method Upload ' + title,'resDict':resDict}
            return render_template('upload.html',vars=vars)    
    else:
        
        name, ext = os.path.splitext(submFile.filename)
        if ext not in ('.' + gt_ext):
            resDict = {"calculated":False,"Message":"File not valid. A " + gt_ext.upper() + " file is required."}
            if request.args['json']=="1":
                return json.dumps(resDict,indent=4)            
            else:
                vars = {
                    # 'url':url, 
                    'title':'Method Upload ' + title,'resDict':resDict}
                return render_template('upload.html',vars=vars)    
    
        p = {
            'g': os.path.join(".","gt","gt." + gt_ext), 
            's': os.path.join(".","output","subm." + gt_ext), 
            'o': os.path.join(".","output")
        }
        global PARAMS
        setattr(PARAMS, 'GT_PATH', os.path.join(".","gt","gt." + gt_ext))
        setattr(PARAMS, 'SUBMIT_PATH', os.path.join(".","output","subm." + gt_ext))
        setattr(PARAMS, 'OUTPUT_PATH', os.path.join(".","output"))

        # apply response to evaluation
        if 'transcription' in request.form.keys() and request.form['transcription'] == 'on':
            setattr(PARAMS, 'TRANSCRIPTION', True)
        else:
            setattr(PARAMS, 'TRANSCRIPTION', False)
        
        if 'confidence' in request.form.keys() and request.form['confidence'] == 'on':
            setattr(PARAMS, 'CONFIDENCES', True)
        else:
            setattr(PARAMS, 'CONFIDENCES', False)

        if 'mode' in request.form.keys() and request.form['mode'] == 'endtoend':
            setattr(PARAMS, 'E2E', True)
        else:
            setattr(PARAMS, 'E2E', False)
        for k,_ in submit_params.items():
            p['p'][k] = request.form.get(k)

        if os.path.isfile(p['s']):
            os.remove(p['s'])

        submFile.save(p['s'])
        
        import random
        import string
        save_name = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        module = importlib.import_module(evaluation_script )
        p["save_name"] = save_name
        resDict = rrc_evaluation_funcs.main_evaluation(p,module.default_evaluation_params,module.validate_data,evaluate_method,save_name=save_name)

        
        if resDict['calculated']==True:
            method_result = json.dumps(resDict['method'],indent=4)
            add_submission(method_result, p)
        
        # if request.args['json']=="1":
        #     return json.dumps( {"calculated": resDict['calculated'],"Message": resDict['Message'],'id':id},indent=4 )
        # else:
        vars = {
            # 'url':url, 
        'title':'Method Upload ' + title,'resDict':resDict,'id':id}
        return render_template('upload.html',vars=vars)    


@app.route('/gt/<path:path>')
def send_gt(path):
    return send_from_directory('gt', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/method/', methods=['GET'])
def method():
    # print(dir(request))
    # print(request.full_path)
    print(request.host_url)
    # input()
    
    results = None
    page = 1
    subm_data = {}
    if 'm' in request.args:
        id = request.args['m']
        submFilePath = os.path.join(".","output","results_" + id   + ".zip")

        if os.path.isfile(submFilePath):
            results = zipfile.ZipFile(submFilePath,'r')
        if 'p' in request.args:
            page = int(request.args['p'])
        
        subm_data = get_submission(id)
        print("subm_data",subm_data)
        if results is None or subm_data is None:
            redirect('/')
    else:
        redirect('/')
    if subm_data is None:
        redirect('/')
    # submitId, methodTitle, submitDate, methodResultJson = subm_data

    subm_data = {
        "submitId":subm_data[0],
        "methodTitle":subm_data[1],
        "submitDate":subm_data[2],
        "methodResultJson":subm_data[3]
    }
    vars = {
        'id':id,
        'acronym':acronym, 
        'title':title,
        # 'images':images_list,
        'images_list': L[(page-1)*20:page*20],
        'num_pages': math.ceil(len(L) / 20), 
        'method_params':method_params,
        'sample_params':sample_params,
        'results':results,
        'page':page,
        'subm_data':subm_data
    }
    return render_template('method.html',vars=vars)

@app.route('/edit_method', methods=['POST'])
def edit_method():
    id = request.form['id']
    name = request.form['name']
    edit_submission(id, name)

@app.route('/delete_method', methods=['POST'])
def delete_method():
    id = request.form['id']
    delete_submission(id)

    try:
        output_folder = os.path.join(".","output","results_" + id)
        if os.path.isdir(output_folder):
            for root, dirs, files in os.walk(output_folder, topdown=False):
                for f in files:
                    os.remove(os.path.join(root, f))
                for d in dirs:
                    os.rmdir(os.path.join(root, d))
            os.rmdir(output_folder)
        subm_file = os.path.join(".","output","results_" + id + "." + gt_ext)
        results_file = os.path.join(".","output","subm_" + id + ".zip")
        os.remove(subm_file)
        os.remove(results_file)
    except:
        print("Unexpected error:", sys.exc_info()[0])

@app.route('/delete_all', methods=['POST'])
def delete_all():
    output_folder = os.path.join(".", "output")
    try:    
        for root, dirs, files in os.walk(output_folder, topdown=False):
            for f in files:
                os.remove(os.path.join(root, f))
            for d in dirs:
                os.rmdir(os.path.join(root, d))
    except:
        print("Unexpected error:", sys.exc_info()[0])

if __name__=='__main__':
    scheduler = APScheduler()

    def sorted_samplesData(samplesData,num_column_order,sort_order):
        return sorted(samplesData, key=lambda sample:
                    sample[num_column_order],reverse=sort_order=="desc" ) 
    def custom_json_filter(zip_path,sampleId):
        print(zip_path,sampleId)
        try:
            return json.loads(zipfile.ZipFile(zip_path).read( sampleId + '.json'))
        except Exception as ex:
            print(ex)
            return {'recall':0,'precision':0,'hmean':0}    
    app.jinja_env.globals.update(zipfile=zipfile.ZipFile)
    app.jinja_env.globals.update(json=json)
    app.jinja_env.globals.update(round=round)
    app.jinja_env.globals.update(math=math)
    app.jinja_env.globals.update(image_name_to_id=image_name_to_id)
    app.jinja_env.globals.update(enumerate=enumerate)
    app.jinja_env.globals.update(sorted_samplesData=sorted_samplesData)
    app.jinja_env.globals.update(custom_json_filter=custom_json_filter)

    port = PARAMS.PORT
    host = PARAMS.HOST
    scheduler.init_app(app)
    scheduler.start()
    app.run(host=host,port=port, debug=True)
    
    
    
