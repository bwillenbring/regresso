#!/usr/bin/python
from shotgun_api3 import Shotgun
from shotgun_api3 import __version__ as VERSION
from pprint import pprint
import os
import sys
import argparse

# Parse args passed in from command line/Cypress
parser = argparse.ArgumentParser(description='Cypress-Python Bridge')

# Expected args...
parser.add_argument('-baseUrl', action="store", dest="baseUrl")
parser.add_argument('-admin_login', action="store", dest="admin_login")
parser.add_argument('-admin_pwd', action="store", dest="admin_pwd")

# Vars for upload
parser.add_argument('-file_name', action="store", dest="file_name")
parser.add_argument('-field_name', action="store", dest="field_name")
parser.add_argument('-entity_type', action="store", dest="entity_type")
parser.add_argument('-entity_id', action="store", type=int, dest="entity_id")
parser.add_argument('-method', action="store", dest="method")
parser.add_argument('-project_id', action="store", type=int, dest="project_id")

# Place arg values into Python vars
results = parser.parse_args()

# Note: All python vars below are passed in from Cypress like this:
    # cy.exec('python fixtures/python/python_api_file_upload.py ' +
    #     '-file_name ' + options.file_name + ' ' +
    #     '-field_name ' + options.field_name + ' ' +
    #     '-entity_type ' + options.entity_type + ' ' +
    #     '-entity_id ' + options.entity_id + ' ' +
    #     '-baseUrl ' + Cypress.config('baseUrl') + ' ' +
    #     '-admin_login ' + Cypress.config('admin_login') + ' ' +
    #     '-admin_pwd ' + Cypress.config('admin_pwd'),
    # { failOnNonZeroExit: true }
    # )

USER_LOGIN = results.admin_login
USER_PWD = results.admin_pwd
SERVER_PATH = results.baseUrl
FILE_NAME = results.file_name
FIELD_NAME = results.field_name
ENTITY_TYPE = results.entity_type
ENTITY_ID = results.entity_id
PROJECT_ID = results.project_id
METHOD = results.method

# Set your project dict
PROJECT = {"type":"Project", "id": PROJECT_ID}

# Instantiate Shotgun class
sg = Shotgun(SERVER_PATH, login=USER_LOGIN, password=USER_PWD)

# Upload a file to an entity's field
def upload():
    att = sg.upload(ENTITY_TYPE, ENTITY_ID, FILE_NAME, field_name=FIELD_NAME)
    pprint(att)

# Upload a thumbnail on an entity
def upload_thumbnail():
    att = sg.upload_thumbnail(ENTITY_TYPE, ENTITY_ID, FILE_NAME)
    pprint(att)

# Upload a filmstrip thumbnail on an entity
def upload_filmstrip_thumbnail():
    att = sg.upload_filmstrip_thumbnail(ENTITY_TYPE, ENTITY_ID, FILE_NAME)
    pprint(att)

if __name__ == "__main__":
    # Call the method only if it is one of 3 allowed methods...
    if (METHOD in ['upload', 'upload_thumbnail', 'upload_filmstrip_thumbnail']):
        eval('%s()' % METHOD)

    else:
        print "You passed in an invalid method"
        sys.exit(1)
