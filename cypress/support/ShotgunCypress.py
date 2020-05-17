from shotgun_api3 import Shotgun
from shotgun_api3 import __version__ as VERSION
from pprint import pprint
from faker import Faker
fake = Faker()
import sys
import os
import json

SERVER_PATH = 'https://bwillenbring1.shotgunstudio.com'
sg = Shotgun(SERVER_PATH, login='ben.admin', password='1fa60faD')

user = {'type':'HumanUser','id':42}
proj = {'type':'Project','id':69}
page_id = sg.find_one('Page',[['page_type','is','project_overview'],['project','is', proj]])['id']
# Set the user's home page to the Cypress Test Projects shots page
data = {'custom_home_page':{'type':'Page','id':page_id}}
success = sg.update('HumanUser', user['id'], data=data)
pprint (success['custom_home_page']['id'] == page_id)
