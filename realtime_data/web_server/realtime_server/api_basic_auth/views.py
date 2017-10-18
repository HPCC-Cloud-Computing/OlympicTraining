from functools import wraps
from flask import request, Response,jsonify
from realtime_server import app


def check_auth(username, password):
    """This function is called to check if a username /
    password combination is valid.
    """
    return username == 'admin' and password == 'bkcloud'


def send_not_authenticate_resp():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})


def requires_basic_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return send_not_authenticate_resp()
        return f(*args, **kwargs)

    return decorated


@app.route('/basic_auth_api')
@requires_basic_auth
def index():
    return 'Real time data API'


@app.route('/cryptocurrency/price')
@requires_basic_auth
def cryptocurrency_price():
    return jsonify({'eth': '123.4','bitcoin':'4506.3', 'unit': 'USD'})

