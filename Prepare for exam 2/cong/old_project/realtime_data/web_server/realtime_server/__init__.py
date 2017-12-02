from flask import Flask
from flask_sqlalchemy import SQLAlchemy

PORT = 8050

app = Flask(__name__)
app.config['SECRET_KEY'] = 'very secret key'
app.config['TOKEN_EXPIRATION'] = 20
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
db = SQLAlchemy(app)

from api_basic_auth import views
from api_token_auth import views