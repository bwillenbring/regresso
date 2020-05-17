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
parser.add_argument('-TOKEN', action="store", dest="TOKEN")

# Place arg values into Python vars
results = parser.parse_args()
USER_LOGIN = results.admin_login
USER_PWD = results.admin_pwd
SERVER_PATH = results.baseUrl

# Instantiate Shotgun class
sg = Shotgun(SERVER_PATH, USER_LOGIN, USER_PWD)

def my_function():
    # Send a value back to Cypress by simply printing something like this
    print sys.version


if __name__ == "__main__":
    # Call your own function here
    my_function()
