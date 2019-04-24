var express = require('express.io')
var uuid = require('uuid');
var { EventHubClient, EventPosition } = require('@azure/event-hubs');

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
var sensorStateTableConnectionString = process.env.SENSOR_STATE_TABLE_CONNSTRING || ''
var tableSvc = azureStorage.createTableService(sensorStateTableConnectionString);

// Setup your sessions, just like normal.
app.use(express.cookieParser())
app.use(express.session({ secret: 'enviromon' }))

// Session is automatically setup on initial request.
app.get('/', function (req, res) {
  req.session.loginDate = new Date().toString()
  res.sendfile(__dirname + '/index.html')
});

app.use(express.static(__dirname + '/static'));


var printError = function (err) {
  console.log(err.message);
};


var broadcastData = function (ehEvent) {
  app.io.broadcast('data', ehEvent.body);
  return;
};


var ehClient;
EventHubClient.createFromIotHubConnectionString(eventHubConnectionString).then(function (client) {
  console.log("Successfully created the EventHub Client from Azure IoT Hub connection string.");
  ehClient = client;
  return ehClient.getPartitionIds();
}).then(function (ids) {
  console.log("The partition ids are: ", ids);
  return ids.map(function (id) {
    return ehClient.receive(id, broadcastData, printError, { eventPosition: EventPosition.fromEnqueuedTime(Date.now()) });
  });
}).catch(printError);


app.io.route('ready', function (req) {
  var query = new azureStorage.TableQuery()
    .where('PartitionKey eq ?', 'Forbes');
  tableSvc.queryEntities('DeviceState', query, null, function (error, result, response) {
    if (!error) {
      sortBy(response.body.value, 'DeviceId')
      response.body.value.forEach(function (value) {
        // console.log(value.Location);
        app.io.broadcast('data', value);
      });
    }
  });
});

app.listen(process.env.port || 7076)