'use strict';
const https = require('https');

const _this = this;

module.exports.GET = function (options, callback) {
  options.method = 'GET';
  _this.REQUEST(options, '', callback);
}

module.exports.POST = function (options, data, callback) {
  options.method = 'POST'
  _this.REQUEST(options, data, callback);
}

module.exports.REQUEST = function (options, data, callback) {
  console.log(options);
  let req = https.request(options, (res) => {
    let out = '';
    res.on('data', (d) => {
      out += d;
    });
    res.on('end', () => {
      console.log(out);
      callback(out);
    });
  }).on('error', (e) => {
    console.error('Web Request Error: '+e);
    callback(e)
  })
  console.log('Sending data: '+data);
  req.end(data);
};
