'use strict';
const AWS = require('aws-sdk');
const wr = require('./WebRequests');

const docClient = new AWS.DynamoDB.DocumentClient();
const dbTable = process.env.DDB_DISCORD_WEBHOOKS;


function buildNewDiscordWebhook(id, data) {
  this.hostname = 'discordapp.com';
  this.path = '/api/webhooks/' + id + '/' + data;
  this.headers = {
    'Content-Type': 'application/json',
  }
  this.fullpath = 'https://' + this.hostname + this.path;
}

module.exports.handler = (event, context) => {
  console.log(JSON.stringify(event));

  let alertContent = event.Records[0].Sns;
  let message = JSON.parse(alertContent.Message);
  console.log(message);

  if (message.type == 'live') {

    let params = {
      TableName: dbTable,
      Key: {
        'keyID' : message.keyID,
      }
    };

    console.log(params);
    docClient.get(params, (err, data) => {
      if (err) console.error('Unable to retrieve record '+message.keyID+' ('+err+')')
      else {
        console.log(data);

        let creds = new buildNewDiscordWebhook(message.keyID, data.Item.keyData);

        checkDiscordWebhook(creds, (response) => {
          console.log(response);
          if (!response) {
            // Remove broken webhook
            console.log('Webhook broken')
          } else {
            let discordMessage = {
              username: 'Twitch Stream',
              avatar_url: 'https://i.imgur.com/i0138kX.png', // Uploaded specifically for this
              //content: '@here Someone has just gone live!',
              embeds: [
                {
                  author: {
                    name: message.user.display_name,
                    url: 'http://twitch.tv/'+message.user.login,
                    icon_url: message.user.profile_image_url.replace('{width}','200').replace('{height}','200'),
                  },
                  title: message.title,
                  url: 'http://twitch.tv/'+message.user.login,
                  description: 'Playing: '+message.game.name,
                  color: 6570405, // Twitch Purple = 6570405
                  thumbnail: {
                    url: message.thumbnail_url.replace('{width}','300').replace('{height}','200'),
                  },
                  footer: {
                    text: 'Alerts by Grumpy Leopard',
                    icon_url: 'https://i.imgur.com/DIuP4RV.jpg',
                  },
                  timestamp: message.started_at,
                }
              ],
            }

            wr.POST(creds, JSON.stringify(discordMessage), (response) => {
              console.log(message);
              console.log(response);
            })
          }
        })
      }
    })
  }
}

function checkDiscordWebhook(options, callback) {
  console.log(options);
  wr.GET(options, (response) => {
    console.log(response);
    let verification = JSON.parse(response);
    if ((verification.name) && (response.code == undefined)) {
      callback(true);
    } else {
      callback(false);
    }
  })
}
