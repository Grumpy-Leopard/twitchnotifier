'use strict';
const wr = require('./WebRequests');
const crypto = require('crypto');

const _this = this;

// These need to be set on the deployment machine as environment variables!
const clientID = process.env.TWITCH_CLIENT_ID;
const hubSecret = process.env.TWITCH_CLIENT_HUB_SECRET;

function buildNewTwitchAPI(path) {
  this.hostname = 'api.twitch.tv';
  this.path = '/helix' + path;
  this.headers = {
    'Client-ID': clientID
  };
  this.fullpath = 'https://' + this.hostname + this.path;
}

const usernameAPI = '/users?login=';
const userAPI = '/users?id=';
const gameAPI = '/games?id=';
const streamAPI = '/streams?user_id=';
const hubAPI = '/webhooks/hub?';

module.exports.verifyHubSignature = function (payload, signature) {
  const calculated = 'sha256=' + crypto.createHmac('sha256', hubSecret).update(payload).digest('hex');
  let verified = signature === calculated;
  console.log('Verifying HMAC Signature: '+signature+' '+calculated+' '+verified)
  return verified;
}

module.exports.registerStreamAlerts = function (action, userid, handler, time, callback) {
  let streamURI = (new buildNewTwitchAPI(streamAPI+userid)).fullpath;
  console.log(streamURI);
  
  let hub = [
    'hub.mode='+action,
    'hub.topic='+streamURI,
    'hub.callback='+handler,
    'hub.lease_seconds='+time,
    'hub.secret='+hubSecret,
  ].join('&');

  let options = new buildNewTwitchAPI(hubAPI + hub);
  console.log(options);

  wr.POST(options, '', (response) => {
    callback(response);
  })
}

module.exports.getUserByName = function (username, callback) {
  let options = new buildNewTwitchAPI(usernameAPI + username);
  console.log(options);

  wr.GET(options, (response) => {
    let resp = JSON.parse(response).data;
    console.log(resp);
    if (resp.length !== 0) {
      callback(resp[0]);
    } else {
      console.error('Unable to retrieve user details: '+username);
      callback(null);
    }
  });
}

module.exports.getUserByID = function (userid, callback) {
  let options = new buildNewTwitchAPI(userAPI + userid);
  console.log(options);

  wr.GET(options, (response) => {
    let resp = JSON.parse(response).data;
    console.log(resp);
    if (resp.length !== 0) {
      callback(resp[0]);
    } else {
      console.error('Unable to retrieve user details: '+userid);
      callback(null);
    }
  });
}

module.exports.getGameByID = function (gameid, callback) {
  let options = new buildNewTwitchAPI(gameAPI + gameid);
  console.log(options);

  wr.GET(options, (response) => {
    let resp = JSON.parse(response).data;
    console.log(resp);
    if (resp.length !== 0) {
      callback(resp[0]);
    } else {
      console.error('Unable to retrieve game details: '+gameid);
      callback(null);
    }
  });
}

