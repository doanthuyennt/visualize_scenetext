import zipfile
import pathlib

gTArchivePath = pathlib.Path("gt/gt.zip")
gTArchive = zipfile.ZipFile(gTArchivePath,'r')


def get_samples():
    imagesFilePath = pathlib.Path("gt/images.zip")
    archive = zipfile.ZipFile(imagesFilePath,'r')
    num_samples = 0
    samples_list = []
    for image in archive.namelist():
        if image_name_to_id(image) != False:
            num_samples += 1
            samples_list.append(image)
    return num_samples,samples_list

def image_name_to_id(name):
    # m = re.match(image_name_to_id_str,name)
    # if m == None:
    #     return False
    # id = m.group(1)
    id = name.replace('.jpg', '').replace('.png', '').replace('.gif', '').replace('.bmp', '').replace('.json', '').replace('.jpeg', '')
    if id+'.json' not in gTArchive.namelist():
        return False
    return id

def get_sample_id_from_num(num):
    imagesFilePath = pathlib.Path("gt/images.zip")
    archive = zipfile.ZipFile(imagesFilePath,'r')
    current = 0
    nameList = archive.namelist()
    nameList.sort()
    # for image in archive.namelist():
    #     if image_name_to_id(image) != False:
    #         current += 1
    #         if (current == num):
    #             return image_name_to_id(image)
    return image_name_to_id(nameList[num-1])
