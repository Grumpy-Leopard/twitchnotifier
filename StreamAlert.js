'use strict';
const SNS = require('./PushSNS');
const TwitchAPI = require('./TwitchAPI');

const debugsnsarn = process.env.TWITCH_ALERT_SNSARN_DEBUG;
const snsarn = process.env.TWITCH_ALERT_SNSARN;

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));

  if (event.queryStringParameters !== null) {
  
    if ('hub.mode' in event.queryStringParameters) {
      // Subscription response
      if ('hub.challenge' in event.queryStringParameters) {
        // Verified, challenged
        let topic = event.queryStringParameters['hub.topic'];
        let lease = event.queryStringParameters['hub.lease_seconds'];
        console.log('Challenge received: '+topic+' ('+lease+'s)');
        let challenge = event.queryStringParameters['hub.challenge'];
        answerTwitchChallenge(challenge);
        publishNewSubscriptionSuccess(topic, lease);
      } else {
        // Failed to verify
        let topic = event.queryStringParameters['hub.topic'];
        let reason = event.queryStringParameters['hub.reason'];
        console.error('Subscription failed: '+topic+' ('+reason+')');
        publishNewSubscriptionFail(topic, reason);
        respondEmptySuccess();
      }
    }    
  } else {
    if (event.headers['x-hub-signature'] !== undefined) {
      if (TwitchAPI.verifyHubSignature(event.body, event.headers['x-hub-signature'])) {
        let dataset = JSON.parse(event.body).data;
        for (let i = 0, len = dataset.length; i < len; i++) {
          console.log(dataset[i]);
          publishSubscriptionEvent(dataset[i]);
        }
        respondEmptySuccess();
      } else {
        console.error('Verification failed - invalid alert ignored.');
        //TODO: Pass the invalid entries to debug
      }
    } else {
      // No known response will reach here if it's come from Twitch
      console.error('Unknown packet received - passing to broker to handle.');
    }
  }
  

  function publishNewSubscriptionSuccess(topic, lease) {
    let messageData = {
      alert_type: 'subscribesuccess',
      topic: topic,
      lease_seconds: lease,
    }
    SNS.pushMessage(messageData, debugsnsarn);
  }

  function publishNewSubscriptionFail(topic, reason) {
    let messageData = {
      alert_type: 'subscribefail',
      topic: topic,
      reason: reason,
    }
    SNS.pushMessage(messageData, debugsnsarn);
  }


  function publishSubscriptionEvent(event) {
    let messageData = {
      alert_type: 'streamnotify',
      event: event,
    }
    SNS.pushMessage(messageData, snsarn);
  }

  // Simple response for Twitch API Registration callbacks
  // https://dev.twitch.tv/docs/api/webhooks-reference/#subscription-verify-request-from-twitch-to-client
  function answerTwitchChallenge(challenge) {
    const response = {
      statusCode: 200,
      body: challenge
    };

    console.log('Respond with challenge code');
    callback(null, response);
  }

  function respondEmptySuccess() {
    const response = {
      statusCode: 200,
      body: 'Notified.',
    };
    
    console.log('Respond with empty 200 OK');
    callback(null, response);
  }
};
