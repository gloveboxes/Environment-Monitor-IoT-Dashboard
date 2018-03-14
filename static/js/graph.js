var io = io.connect();

var chart = c3.generate({
  bindto: '#graph',
  data: {
    x: 'x',
    columns: [
    ]
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: {
        format: '%X'
      }
    }
  }
});


var DATA_POINT_COUNT = 20;
var labels = [];
var columns = [];
var geolocation = [];

function roundToOne(num) {    
  return +(Math.round(num + "e+1")  + "e-1");
}

var appendColumn = function (index, label, value) {
  if (!value) {
    console.log('value is null ' + label + ' is skipped');
  } else {
    if (columns.length <= index) {
      columns.push([label]);
    }
    columns[index].push(value);
    if (columns[index].length > DATA_POINT_COUNT) {
      columns[index].splice(1, 1);
    }
  }
};

var addLabel = function (data) {
  var a = labels.indexOf(data.deviceid);
  if (a == -1) {
    labels.push(data.deviceid);
    a = labels.length - 1;
  }
  return a;
}

io.on('data', function (incomingData) {
  var pos = addLabel(incomingData);

  if (incomingData.timestamp) {

    appendColumn(0, 'x', new Date(incomingData.timestamp));
    appendColumn(pos + 1, labels[pos], roundToOne(incomingData.maxtemperature));

  } else {
    console.log('bad timestamp is skipped');
  }
  chart.load({
    columns: columns
  });
});

// Listen for session event.
io.emit('ready');
