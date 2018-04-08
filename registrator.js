'use strict';
const wr = require('./WebRequests');
const TwitchAPI = require('./TwitchAPI');

module.exports.handler = (event, context, callback) => {

  // Check for DEBUG flag
  let isDebug = null
  if ((event.queryStringParameters !== null) &&
  ('isDebug' in event.queryStringParameters)) {
    isDebug = event.queryStringParameters['isDebug'];
  }

  // Get own API URL and build URLs to use for callbacks
  //if (event.headers !== null && event.requestContext['stage'] !== 'test-invoke-stage') {
    const baseNotificationURI = event.headers["X-Forwarded-Proto"] + "://" + event.headers["Host"] + "/" + event.requestContext["stage"];
    const ownNotificationURI = baseNotificationURI + event.path;
    const followNotificationURI = baseNotificationURI + process.env.FOLLOW_NOTIFICATION_HANDLER;
    const streamNotificationURI = baseNotificationURI + process.env.STREAM_NOTIFICATION_HANDLER;
  //}

  let time = null;
  if ((event.queryStringParameters !== null) &&
  ('time' in event.queryStringParameters)) {
    time = event.queryStringParameters['time'];
  } else {
    time = 1200;
  }

  let user = null;
  if ((event.queryStringParameters !== null) &&
  ('user' in event.queryStringParameters)) {
    user = event.queryStringParameters['user'];
    let users = user.split(',');
    for (let i = 0, len = users.length; i < len; i++) {
      TwitchAPI.getUserByName(users[i], (user) => {
        //debugResponse('Welcome '+user.display_name+' (ID: '+user.id+')');
        TwitchAPI.registerStreamAlerts('subscribe', user.id, streamNotificationURI, time, (response) => {
          //debugResponse(response);
        })
      })
    }
  debugResponse('Done. '+users);
  }


  function debugResponse(message) {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        DEBUG: message,
        Event: ((isDebug) ? event : undefined),
        Context: ((isDebug) ? event : undefined),
        Environment: ((isDebug) ? process.env : undefined),
      }),
    };

    callback(null, response);
  }
};
