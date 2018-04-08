'use strict';
const AWS = require('aws-sdk');
const SNS = require('./PushSNS');
const TwitchAPI = require('./TwitchAPI')

const docClient = new AWS.DynamoDB.DocumentClient();
const snsarn = process.env.PUBLISH_DISCORD_SNSARN;

const dbTable = process.env.DDB_TWITCH_STREAMERS;

module.exports.handler = (event, context) => {
  console.log(JSON.stringify(event));

  let alertContent = event.Records[0].Sns;
  let message = JSON.parse(alertContent.Message);
  console.log(message);

  if (message.alert_type == 'streamnotify') {
    let content = message.event;
    let params = {
      TableName: dbTable,
      Key: {
        'userID' : content.user_id
      }
    };

    TwitchAPI.getUserByID(content.user_id, (user) => {
      content.user = user;
      TwitchAPI.getGameByID(content.game_id, (game) => {
        content.game = game;

        console.log(params);
        docClient.get(params, (err, data) => {
          if (err) console.error('Unable to retrieve record '+content.user_id+' ('+err+')')
          else {
            console.log(data);
            let keys = JSON.parse(data.Item.keyIDs);
            for (let i = 0, len = keys.length; i < len; i++) {
              content.keyID = keys[i];
              SNS.pushMessage(content, snsarn)
            }
          }
        })
      })
    })
  }
  
};
