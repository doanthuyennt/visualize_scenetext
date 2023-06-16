import pathlib
import zipfile

import io

from PIL import Image

import flask

from flask import Blueprint
from flask import send_file, request


image_blueprint = Blueprint(
    "image",  __name__
)

def get_sample_from_num(num):
    imagesFilePath = pathlib.Path("gt/images.zip")
    archive = zipfile.ZipFile(imagesFilePath,'r')
    current = 0
    # for image in archive.namelist():
    #     if image_name_to_id(image) != False:
    #         current += 1
    #         if (current == num):
    #             return image,archive.read(image)
    nameList = archive.namelist()
    nameList.sort()
    return nameList[num-1],archive.read(nameList[num-1])        
    return False	

@image_blueprint.route('/image_thumb/', methods=['GET'])
def image_thumb():

    sample = int(request.args['sample'])
    fileName,data = get_sample_from_num(sample)
    ext = fileName.split('.')[-1]
    
    f = io.BytesIO(data)	
    image = Image.open(f)

    maxsize = (205, 130)
    image.thumbnail(maxsize)
    output = io.BytesIO()
	
    if ext=="jpg" or ext=="jpeg":
            im_format = "JPEG"
            header = "image/jpeg"
            image.save(output,im_format, quality=80, optimize=True, progressive=True)
    elif ext == "gif":
            im_format = "GIF"
            header = "image/gif"
            image.save(output,im_format)
    elif ext == "png":
            im_format = "PNG"
            header = "image/png"
            image.save(output,im_format, optimize=True)
    
    contents = output.getvalue()

    output.close()
    
    return send_file(
        io.BytesIO(contents),
        mimetype='image/jpeg',
        )

@image_blueprint.route('/image/', methods=['GET'])
def image():
    sample = int(request.args['sample'])
    fileName,data = get_sample_from_num(sample)

    ext = fileName.split('.')[-1]
    f = io.BytesIO(data)
    image = Image.open(f)
    output = io.BytesIO()
    if ext=="jpg" or ext=="jpeg":
            im_format = "JPEG"
            header = "image/jpeg"
            image.save(output,im_format, quality=80, optimize=True, progressive=True)
    elif ext == "gif":
            im_format = "GIF"
            header = "image/gif"
            image.save(output,im_format)
    elif ext == "png":
            im_format = "PNG"
            header = "image/png"
            image.save(output,im_format, optimize=True)        
    
    
    contents = output.getvalue()
    output.close()
    
    body = data

    return send_file(
        io.BytesIO(contents),
        mimetype='image/jpeg',
        )