
import pathlib
import zipfile
import json

from flask import request, render_template
from flask import Blueprint

from utils.utils import get_samples, get_sample_id_from_num, num_samples
from utils.utils import samples_list as images_list 

from database.query import get_submission, get_all_submissions

from config.config import *

sample_blueprint = Blueprint(
    "sample", __name__
)


@sample_blueprint.route('/sample/')
def sample():
    
    # num_samples,images_list = get_samples()    

    sample = int(request.args['sample'])
    methodId = request.args['m']
    subm_data = get_submission(methodId)

    samplesValues = []
    
    id = get_sample_id_from_num(int(sample))
    sampleId = id + ".json"
    
    subms = get_all_submissions()
    for methodId,methodTitle,_,_ in subms:
        sampleResults = {"id":methodId, "title":methodTitle}
        zipFolderPath = pathlib.Path("output/results_" + str(methodId))
        sampleFilePath = zipFolderPath / str(sampleId)
        exist = True
        if not sampleFilePath.is_file():
            submFilePath = pathlib.Path("output/results_" + str(methodId) + ".zip")
            archive = zipfile.ZipFile(submFilePath,'r')
        
            if not zipFolderPath.exists():
                zipFolderPath.mkdir(exist_ok=True,parents=True)
            try:
                archive.extract(sampleId, zipFolderPath)
            except:
                exist = False
        if exist:
            file = open(sampleFilePath,"r")
            results = json.loads(file.read())
            file.close()
        
        if exist:
            for k,v in sample_params.items():
                sampleResults[k] = results[k]
        else:
            for k,v in sample_params.items():
                sampleResults[k] = 0.0
        samplesValues.append( sampleResults )
    art = ''
    if 'art' in list(request.args.keys()):
        art = request.args['art']
    # for d in dir(request):
    #     print(d)
    # from config.config import constraints
    vars = {
                'acronym':acronym,
                'title':title + ' - Sample ' + str(sample) + ' : ' + images_list[sample-1],
                'sample':sample,
                'num_samples':num_samples,
                'subm_data':subm_data,
                'samplesValues':samplesValues,
                'sample_params':sample_params,
                'customJS':customJS,
                'customCSS':customCSS,
                # 'constraints':constraints,
                'art':art,
                'methodId':methodId,
                # 'artList':constraints
            }
    return render_template('sample.html',vars=vars)


@sample_blueprint.route('/sampleInfo/', methods=['GET'])
def get_sample_info():
    methodId = request.args['m']    
    print(methodId)
    submFilePath = pathlib.Path("output/results_" + str(methodId) + ".zip")
    archive = zipfile.ZipFile(submFilePath,'r')
    id = get_sample_id_from_num(int(request.args['sample']))
    results = json.loads(archive.read(id + ".json"))
    if 'art' in list(request.args.keys()): 
        art =  request.args['art'] 
        print(art == 'undefined')
        print(art)
        if art != 'undefined':
            temp = {}
            for k,v in results.items():
                if art in k:
                    temp[k.replace("_ART_"+art,"")] = v
            results = temp
    return json.dumps(results)