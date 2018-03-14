var express = require('express.io')
var uuid = require('uuid');
var EventHubClient = require('azure-event-hubs').Client;
var azureStorage = require('azure-storage');
var sortBy = require('sort-array')
try {
  // https://stackoverflow.com/questions/22312671/node-js-setting-environment-variables
  // load environment variables from .env file - used for dev only.
  require('dotenv').config();
}
catch (err) { };

app = express().http().io()

var eventHubConnectionString = process.env.EVENTHUB_CONNSTRING || ''
var eventHubName = process.env.EVENTHUBNAME || 'chart-data'
var sensorStateTableConnectionString = process.env.SENSOR_STATE_TABLE_CONNSTRING || ''
var client = EventHubClient.fromConnectionString(eventHubConnectionString, eventHubName)
var tableSvc = azureStorage.createTableService(sensorStateTableConnectionString);

// Setup your sessions, just like normal.
app.use(express.cookieParser())
app.use(express.session({ secret: 'enviromon' }))

// Session is automatically setup on initial request.
app.get('/', function (req, res) {
  req.session.loginDate = new Date().toString()
  res.sendfile(__dirname + '/index.html')
});


var processEvent = function (ehEvent) {
  app.io.broadcast('data', ehEvent.body);
  return;

  // this code required if processing an json array of data
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

  var query = new azureStorage.TableQuery()
  .where('PartitionKey eq ?', 'Forbes');
  tableSvc.queryEntities('DeviceState',query, null, function(error, result, response) {
    if(!error) {
      sortBy(response.body.value, 'DeviceId')
      response.body.value.forEach(function (value){
        // console.log(value.Location);
        app.io.broadcast('data', value);
      });
    }
  });

  // For each partition, register a callback function
  client.getPartitionIds().then(function (ids) {
    ids.forEach(function (id) {
      var minutesAgo = 0;
      var before = (minutesAgo * 60 * 1000);
      client.createReceiver('reporting', id, { startAfterTime: Date.now() - before })
        .then(function (rx) {
          rx.on('errorReceived', function (err) { console.log(err); });
          rx.on('message', processEvent);
        });
    });
  });
});

app.listen(process.env.port || 7076)