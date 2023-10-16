from flask import Flask
from config import get_config
from app.routes import bp
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_session import Session

app = Flask(__name__,  template_folder='templates')

app.config.from_object(get_config('development')) 

app.register_blueprint(bp) 
# Initiate DB
db = SQLAlchemy(app)

# Set up flask CSRF
csrf = CSRFProtect(app)
 

if __name__ == '__main__':
    app.run(debug=True, port=8000)
 
 