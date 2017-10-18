// var request = require('request');
var requestPromise = require('request-promise');
var Buffer = require('buffer').Buffer;
var timeOut = 10000;
var intervalTime = 4000;
var ROOT_URL = "http://127.0.0.1:8050/";
var adminUserName = 'admin';
var adminPassword = 'bkcloud';
// request('http://www.google.com', function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
// });


// function makeBasicAuthAPIRequest(basicAuthAPIUrl, username, password) {
//     var auth_data = new Buffer(username + ":" + password).toString('base64');
//     var reqOptions = {
//         url: basicAuthAPIUrl,
//         headers: { 'Authorization': 'Basic ' + auth_data }
//     };
//     // make request to basic auth api url with headers
//     var processResp = function (error, response, body) {
//         console.log('error:', error); // Print the error if one occurred
//         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         console.log('body:', body); // Print the HTML for the Google homepage.
//     };
//     request(reqOptions, processResp);
// }

// var basicAuthAPIUrl = ROOT_URL + "basic_auth_api";
// var basicAuthInterval = setInterval(makeBasicAuthAPIRequest,
//     intervalTime, basicAuthAPIUrl, adminUserName, adminPassword);

// setTimeout(function () {
//     clearInterval(basicAuthInterval);
// }, 20000);

function getToken(loginUrl, username, password) {
    var reqOptions = {
        method: 'POST',
        uri: loginUrl,
        // headers: {'Authorization': 'Basic ' + auth_data},
        form: { 'username': username, 'password': password },
        json: true,
        resolveWithFullResponse: true
    };
    return requestPromise(reqOptions);
}

function processGetTokenResp(response, token) {
    if (response.statusCode == 200 && response.body.status == 'success') {
        token.valid = true;
        token.data = response.body.token;
    }
}

function getApiDataRequest(apiUrl, token) {
    var reqOptions = {
        method: 'GET',
        uri: apiUrl,
        headers: { 'token': token.data },
        json: true,
        resolveWithFullResponse: true
    };
    return requestPromise(reqOptions);
}

function processGetApiResp(response, token) {
    return { payload: response.body, status: 'success' };
}

function getTokenAuthAPIData(loginUrl, apiUrl, username, password, token) {
    if (token.valid == false) {
        console.log('Token is expired. Renew token.');
        tokenAuthRequest = getToken(loginUrl, adminUserName, adminPassword);
        tokenAuthRequest.then(function (response) {
            processGetTokenResp(response, token);
            tokenApiRequest = getApiDataRequest(apiUrl, token);
            tokenApiRequest.then(function (response) {
                resultData = processGetApiResp(response, token);
                console.log(resultData.payload);
            });
        });
    }
    else {
        tokenApiRequest = getApiDataRequest(apiUrl, token);
        tokenApiRequest.then(function (response) {
            resultData = processGetApiResp(response, token);
            console.log(resultData.payload);
        }).catch(function (errorResponse) {
            console.log('Failed to get data from API');
            console.log(errorResponse.message);
            console.log(errorResponse.statusCode);
            token.valid = false;
            token.data = null;
        });
    }
}


var token = { valid: false, data: null };
var loginUrl = ROOT_URL + 'weather/get_token';
var apiUrl = ROOT_URL + "weather/temperature";

// getTokenAuthAPIData(loginUrl, apiUrl, adminUserName, adminPassword, token);
var tokenAuthInterval = setInterval(getTokenAuthAPIData,
    intervalTime, loginUrl, apiUrl, adminUserName, adminPassword, token);

setTimeout(function () {
    clearInterval(tokenAuthInterval);
}, 120000);


// function getPublicRequest(apiUrl) {
//     var reqOptions = {
//         method: 'GET',
//         uri: apiUrl,
//         json: true,
//         resolveWithFullResponse: true
//     };
//     return requestPromise(reqOptions);
// }

// publicUrl = ROOT_URL + "weather/public_temperature";

// publicApiRequest = getPublicRequest(publicUrl);
// publicApiRequest.then(function (response) {
//     console.log(response.body);
// }).catch(function (err) {
//     console.log('err');
// });
