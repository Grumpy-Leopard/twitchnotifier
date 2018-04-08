'use strict';
const AWS = require('aws-sdk');
const SNS = require('./PushSNS');

const docClient = new AWS.DynamoDB.DocumentClient();

const snsarn = process.env.STREAM_SUBSCRIBE_SNSARN;
const renewPeriod = process.env.STREAM_SUBSCRIBE_RENEWAL_PERIOD

module.exports.handler = (event, context) => {
  console.log(event);

  let params = {
    TableName: process.env.DDB_TWITCH_STREAMERS,
    Select: 'ALL_ATTRIBUTES',
  };

  docClient.scan(params, (err, data) => {
    if (err) console.error(err);
    else {
      console.log(data.Items);
      data.Items.forEach((item) => {
        let message = {
          action: 'subscribe',
          user: item.userID,
          time: renewPeriod,
        }

        SNS.pushMessage(message, snsarn)
      })
    }
  })
}