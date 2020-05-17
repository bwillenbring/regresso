#!/usr/bin/python
from shotgun_api3 import Shotgun
from shotgun_api3 import __version__ as VERSION
from pprint import pprint
import os
import sys

# For REST api requests
import requests
import json

# For file handling
from pathlib import Path
import mimetypes
import stat

# Misc test vars
USER_LOGIN = os.environ['admin_login']
USER_PWD = os.environ['admin_pwd']
SERVER_PATH = os.environ['baseUrl']
FILE_NAME = os.environ['file_name']
FIELD_NAME = os.environ['field_name']
ENTITY_TYPE = os.environ['entity_type']
ENTITY_ID = int(os.environ['entity_id'])
TOKEN = os.environ['TOKEN']
sep = "-" * 75

def main():
    upload_file_to_entity(ENTITY_TYPE, ENTITY_ID, FILE_NAME, FIELD_NAME)

def get_headers():
    """Returns a dictionary with headers with 2 keys: Authorization and content-type"""
    headers = {
        "Authorization": "Bearer %s" % TOKEN,
        "content-type": "application/json"
    }
    return headers

def upload_file_to_entity(entity, entity_id, file_to_upload, field_name):
    """This test case uploads a file to a given entity's field
    eg: /api/v1/entity/Asset/845/image/_upload?filename=foo.jpg
    Upload occurs in 3 steps...
      - 1) Request an upload URL
      - 2) Upload the file to the upload URL
      - 3) Link the uploaded file to the entity
    """
    is_s3 = False
    filename = os.path.basename(file_to_upload)
    url = "%s/api/v1/entity/%s/%s/%s/_upload?filename=%s" % (SERVER_PATH, entity, entity_id, field_name, filename)
    headers = get_headers() # Returns a dict with 2 keys (Authorizaton, content-type)

    # --------------------------------------------------
    # Part 1. Request upload url
    # --------------------------------------------------
    r1 = requests.get(url, headers=headers, allow_redirects=False)
    if "errors" in r1.json():
        print "Failed at Step 1 with errors. See below:\n%s\n%s" % (r1.json().get("errors"), sep)
        # print sep
        sys.exit(1)
    else:
        upl_data = r1.json().get("data")
        print "Part 1. Response\nStatus: %s" % r1.status_code
        # pprint(r1.json())
        print sep
    # Form the upload_url (for step 2)
    upload_url = r1.json().get("links")["upload"]
    # Fix for [SG-13760] Conditionally alter the upload_url
    # only if the configured Shotgun URL contains port :8888 and the upload_url is plainly wrong
    if (not SERVER_PATH in upload_url) and (':8888' in SERVER_PATH):
        # Insert the port number into the upload_url
        upload_url = upload_url.replace('.com', '.com:8888')

    # Do this check for Amazon s3
    if r1.json().get("data")["storage_service"] == 's3':
        is_s3 = True
        upload_url = r1.json().get("links")["upload"]
        # Also, remove auth header
        del headers["Authorization"]

    # Form the complete_upload_url (for step 3)
    complete_upload_url = SERVER_PATH + r1.json().get("links")["complete_upload"]

    # --------------------------------------------------
    # Part 2. Upload: file_to_upload to: upload_url
    # --------------------------------------------------
    """
    If amazon ... do this
    put url should be links.upload
    do NOT send authorization header
    """

    # Determine if the file exists on disk
    my_file = Path(file_to_upload)

    if not my_file.is_file():
        print "File '%s' does not exist on disk.\ncwd(): %s" % (file_to_upload, os.getcwd())
        sys.exit(1)

    # Read the file data
    with open(file_to_upload, 'rb') as fh:
        mydata = fh.read()
        file_size = os.fstat(fh.fileno())[stat.ST_SIZE]
        fh.close()

    print "file_size: %s" % file_size
    # Adjust content-type and content-size headers
    headers["content-type"] = mimetypes.guess_type(file_to_upload)[0]
    # content-size is only REQUIRED if you are uploading to Amazon (eg: Version => Uploaded movie)
    headers["content-size"] = str(file_size)

    # Make the PUT request
    r2 = requests.put(upload_url, data=mydata, headers=headers)
    # --------------------------------------------------
    # Part 3. Link the upload to the original entity
    # --------------------------------------------------
    # Modify upl_data contents with response of Part 2
    # upl_data is the response from Part 1
    if is_s3 == False:
        upl_data.update(r2.json().get("data"))

    # Modify upl_data with response of Part 1
    mydata = {
        "upload_info": upl_data,
        "upload_data": {}
    }
    # Reset headers to default
    headers = get_headers()
    # Make the final request
    r3 = requests.post(complete_upload_url, headers=headers, json=mydata)

    success = r3.status_code == 201
    if success == True:
        print "Succeeded"
        sys.exit(0)
    else:
        print "Upload failed"
        sys.exit(1)


if __name__ == "__main__":
    main()
