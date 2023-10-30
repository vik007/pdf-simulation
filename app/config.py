# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import os

 
class Config(object):

    basedir = os.path.abspath(os.path.dirname(__file__))

    # Set up the App SECRET_KEY
    # SECRET_KEY = config('SECRET_KEY'  , default='S#perS3crEt_007')
    SECRET_KEY = os.getenv('SECRET_KEY', '1234')
    UPLOAD_PATH = os.path.join(os.getcwd(), "app/static/uploads") #'/home/ubox/Flask_project/pdf-simulation/app/static/uploads'
    
    # This will create a file in <app> FOLDER
    # PostgreSQL database

    SQLALCHEMY_DATABASE_URI = f'mysql://root:admin@{os.getenv("IP", "127.0.0.1")}/pdf_simulation'

    SQLALCHEMY_TRACK_MODIFICATIONS = False 

    # Assets Management
    ASSETS_ROOT = os.getenv('ASSETS_ROOT', '/static/assets')   
    
    
class ProductionConfig(Config):
    DEBUG = False

    # Security
    # SESSION_COOKIE_HTTPONLY = True
    # REMEMBER_COOKIE_HTTPONLY = True
    # REMEMBER_COOKIE_DURATION = 3600

    # PostgreSQL database
    # SQLALCHEMY_DATABASE_URI = '{}://{}:{}@{}:{}/{}'.format(
    #     os.getenv('DB_ENGINE'   , 'mysql'),
    #     os.getenv('DB_USERNAME' , 'root'),
    #     os.getenv('DB_PASS'     , 'root'),
    #     os.getenv('DB_HOST'     , 'localhost'),
    #     os.getenv('DB_PORT'     , 3306),
    #     os.getenv('DB_NAME'     , 'pdf_simulation')
    # ) 

class DebugConfig(Config):
    DEBUG = True


# # Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug'     : DebugConfig
}