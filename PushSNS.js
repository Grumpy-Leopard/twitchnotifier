'use strict';
const AWS = require('aws-sdk');

let _this = this;

module.exports.pushMessage = function(message, arn){
  console.log(arn);
  console.log(message);
  let sns = new AWS.SNS();

  sns.publish({
    Message: JSON.stringify(message),
    TopicArn: arn,
  }, (err, data) => {
    if (err) {
      console.error('Error pushing to SNS: '+err);
      return;
    }
    console.log(data);
  });
}