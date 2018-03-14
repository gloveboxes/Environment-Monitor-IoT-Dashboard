var io = io.connect();

var chart = c3.generate({
  bindto: '#barchart',
  data: {
    columns: [
    ],
    type: 'bar'
  },
  bar: {
    // width: {
    //   ratio: 0.5 // this makes bar width 50% of length between ticks
    // }
    // or
    width: 80 // this makes bar width 100px
  }
});


var DATA_POINT_COUNT = 2;
var labels = [];
var columns = [];
var geolocation = [];

function roundToOne(num) {
  return +(Math.round(num + "e+1") + "e-1");
}

var appendColumn = function (index, label, value) {
  if (!value) {
    console.log('value is null ' + label + ' is skipped');
  } else {
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
    columns[a] = [];
    columns[a].push(data.deviceid);
  }
  return a;
}

io.on('data', function (incomingData) {
  var pos = addLabel(incomingData);

  var e = document.getElementById('lastupdated');
  e.innerText = Date();

  if (incomingData.timestamp) {
    appendColumn(pos, labels[pos], roundToOne(incomingData.celsius));
  } else {
    console.log('bad timestamp is skipped');
  }
  chart.load({
    columns: columns
  });
});

// Listen for session event.
io.emit('ready');
