import time
from functools import wraps
from flask import request, jsonify, abort, g, url_for, Response
from realtime_server import app, db
from models import User


def requires_token_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = request.headers['token']
            if not token or not User.verify_auth_token(token):
                return permission_denied()
            return f(*args, **kwargs)
        except Exception as e:
            print e
            return permission_denied()

    return decorated


@app.route('/weather/temperature')
@requires_token_auth
def get_temperature():
    # print(int(time.time()))
    return jsonify({'temperature': '31', 'unit': 'celsius'})


@app.route('/weather/public_temperature')
def public_temperature_test():
    # print(int(time.time()))
    return jsonify({'temperature': '35', 'unit': 'celsius'})
    # return Response(
    #     'Could not verify your access level for that URL.\n'
    #     'You have to login with proper credentials', 401,
    #     {'WWW-Authenticate': 'Basic realm="Login Required"'})


@app.route('/weather/public_temperature_test1')
def public_temperature_test1():
    # print(int(time.time()))
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401, )


@app.route('/weather/public_temperature_test2')
def public_temperature_test2():
    # print(int(time.time()))
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401, )


def check_login(username, password):
    check_user = User.query.filter_by(username=username).first()
    if not check_user or not check_user.verify_password(password):
        return False
    g.user = check_user
    return True


@app.route('/weather/get_token', methods=["GET", "POST"])
def get_token():
    try:
        g.user = 'None'
        username = request.form['username']
        password = request.form['password']
        if not username or not password or not check_login(username, password):
            return Response('invalid username or password', 400)
        return_token = g.user.generate_auth_token(
            expiration=app.config['TOKEN_EXPIRATION'])
        return jsonify({'status': 'success', 'token': return_token,
                        'message': ''})
    except Exception as e:
        print e
        return Response('invalid username or password',400)


def permission_denied():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})
