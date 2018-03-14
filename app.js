var express = require('express.io')
var uuid = require('uuid');
var EventHubClient = require('azure-event-hubs').Client;
// var IotHubClient = require('azure-iothub').Client;
// var Message = require('azure-iot-common').Message;
try {
  // https://stackoverflow.com/questions/22312671/node-js-setting-environment-variables
  // load environment variables from .env file - used for dev only.
  require('dotenv').config();
}
catch (err){};

app = express().http().io()

// var iotHubConnectionString = process.env.THINGLABS_IOTHUB_CONNSTRING || ''
var eventHubConnectionString = process.env.EVENTHUB_CONNSTRING || ''
var eventHubName = process.env.EVENTHUBNAME || 'chart-data'
var client = EventHubClient.fromConnectionString(eventHubConnectionString, eventHubName)

// Setup your sessions, just like normal.
app.use(express.cookieParser())
app.use(express.session({ secret: 'thinglabs' }))

// Session is automatically setup on initial request.
app.get('/', function (req, res) {
  console.log("root");
  req.session.loginDate = new Date().toString()
  res.sendfile(__dirname + '/index.html')
});


var processEvent = function (ehEvent) {
  ehEvent.body.forEach(function (value) {
    try {
      app.io.broadcast('data', value);
    } catch (err) {
      console.log("Error sending: " + value);
      console.log(typeof (value));
    }
  });
};    // console.log(value);cookieParser

app.use(express.static(__dirname + '/static'));

// Instantiate an eventhub client

app.io.route('ready', function (req) {
  // For each partition, register a callback function
  client.getPartitionIds().then(function (ids) {
    ids.forEach(function (id) {
      var minutesAgo = 5;
      var before = (minutesAgo * 60 * 1000);
      client.createReceiver('$Default', id, { startAfterTime: Date.now() - before })
        .then(function (rx) {
          rx.on('errorReceived', function (err) { console.log(err); });
          rx.on('message', processEvent);
          // rx.on('message', function(message) {
          //     console.log(message.body);
          //     var body = message.body;
          //     try {
          //         app.io.broadcast('data', body);
          //     } catch (err) {
          //         console.log("Error sending: " + body);
          //         console.log(typeof(body));
          //     }
          // });
        });
    });
  });
});

app.listen(process.env.port || 7076)