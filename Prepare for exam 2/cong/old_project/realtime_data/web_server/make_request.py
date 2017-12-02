import datetime
import time
import requests
import base64
from requests.auth import HTTPBasicAuth

ROOT_URL = "http://127.0.0.1:8050/"


# def login_site(session, user_name, password):
#     try:
#         login_url = ROOT_URL + "auth/api_login/"
#         session.get(login_url)
#         csrftoken = session.cookies['csrftoken']
#         login_resp = session.post(login_url,
#                                   data={'csrfmiddlewaretoken': csrftoken,
#                                         'user_name_email': user_name,
#                                         'password': password})
#         # check if login is success or not
#
#         if login_resp.status_code == 200:
#             return True
#         else:
#             return False
#     except Exception as e:
#         return False


# session = requests.Session()
# is_login = login_site(session, 'admin', 'bkcloud')
# if is_login:
#     try:
#         secured_url = "admin/system/cluster_list"
#         r = session.get(ROOT_URL + secured_url, timeout=105)
#         resp_data = r.json()
#         status_code = r.status_code
#         if status_code == 200:
#             pass
#         else:
#             pass
#     except Exception as e:
#         pass
# session.close()


# session = requests.Session()
# try:
#     auth = HTTPBasicAuth('admin', 'bkcloud')
#     secured_url = ""
#     r = session.get(
#         ROOT_URL + secured_url,
#         auth=auth
#     )
#     headers = r.headers
#
#     status_code = r.status_code
#     pass
# except Exception as e:
#     pass
# session.close()


# Basic Authentication
# session = requests.Session()
# try:
#     auth_data = base64.b64encode("admin:bkcloud")
#     headers = {'Authorization': 'Basic ' + auth_data}
#     secured_url = ""
#     r = session.get(
#         ROOT_URL + secured_url,
#         headers=headers
#     )
#     status_code = r.status_code
#     pass
# except Exception as e:
#     pass
# session.close()

# Token Authentication
# session = requests.Session()
# user_name = 'admin'
# password = 'bkcloud'
# try:
#
#     login_url = ROOT_URL + "weather/get_token"
#     temperature_api_url = ROOT_URL + "weather/temperature"
#     login_resp = session.post(login_url,
#                               data={
#                                   'username': user_name,
#                                   'password': password})
#     result_data = login_resp.json()
#     if result_data['status'] == 'success':
#         token = result_data['token']
#         token_expired = False
#         while not token_expired:
#             try:
#                 temp_data_resp = session.get(
#                     temperature_api_url,
#                     headers={'token': token}
#                 )
#                 status_code = temp_data_resp.status_code
#                 if status_code == 200:
#                     temp_data = temp_data_resp.json()
#                     print(
#                         'Current time: ' + str(datetime.datetime.now()) +
#                         ' - ' +
#                         'Current temperature: ' + temp_data['temperature'])
#                     time.sleep(5)
#                 else:
#                     token_expired = True
#                     print("Token is expired!. Stop send request.")
#             except Exception as e:
#                 print e
#                 print("An error has been occurred!. Stop send request.")
#                 token_expired = True
# except Exception as e:
#     print e
#     pass
# session.close()

def get_token(req_session):
    login_url = ROOT_URL + "weather/get_token"
    login_resp = req_session.post(login_url,
                                  data={
                                      'username': user_name,
                                      'password': password})
    result_data = login_resp.json()
    if result_data['status'] == 'success':
        return result_data['token']
    else:
        return None


session = requests.Session()
user_name = 'admin'
password = 'bkcloud'
try:

    temperature_api_url = ROOT_URL + "weather/temperature"
    token = get_token(session)
    if token:
        exception_occurred = False
        while not exception_occurred:
            try:
                temp_data_resp = session.get(
                    temperature_api_url,
                    headers={'token': token}
                )
                status_code = temp_data_resp.status_code
                if status_code == 200:
                    temp_data = temp_data_resp.json()
                    print(
                        'Current time: ' + str(datetime.datetime.now()) +
                        ' - ' +
                        'Current temperature: ' + temp_data['temperature'])
                    time.sleep(5)
                else:
                    print("Token is expired!. System is getting new token.")
                    token = get_token(session)
            except Exception as e:
                print e
                print("An error has been occurred!. Stop send request.")
                exception_occurred = True
except Exception as e:
    print e
    pass
session.close()
