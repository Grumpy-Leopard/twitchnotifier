'use strict';
const AWS = require('aws-sdk');
const TwitchAPI = require('./TwitchAPI');

const streamNotificationURI = process.env.API_BASE_URI + process.env.STREAM_NOTIFICATION_HANDLER;
const dbTable = process.env.DDB_TWITCH_STREAMERS;
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context) => {
  console.log(JSON.stringify(event));

  let alertContent = event.Records[0].Sns;
  let message = JSON.parse(alertContent.Message);

  if (message.action == 'subscribe') {
    console.log('Stream subscribe: '+message.user);
    TwitchAPI.registerStreamAlerts(message.action, message.user, streamNotificationURI, message.time, (response) => {
      console.log(response);
    });
  }

  if (message.action == 'unsubscribe') {
    console.log('Stream unsubscribe: '+message.user);
    TwitchAPI.registerStreamAlerts(message.action, message.user, streamNotificationURI, message.time, (response) => {
      console.log(response);

      var params = {
        TableName: dbTable,
        Key: {
          "userID":message.user,
        },
      }

      console.log('Remove user from db: '+message.user);
      docClient.delete(params, (err, data) => {
        if (err) console.error('Unable to delete user from database. ', JSON.stringify(err));
        else console.log('Remove user successful');
      })
    });
  }
};
