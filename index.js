var express = require('express');
var bodyParser = require('body-parser');
var serialport = require('serialport');

var SERIAL_PORT_SENSOR = 'ACM1';
var SERIAL_PORT_SLAP_MACHINE = 'ACM0';

// serial port handler for WEATHER / SENSORS
var sensorData = {
  connected: false,
  temperature: 0,
  decibel: 0,
  luminosity: 0
};
var sensorBuffer = '';

var weatherSerialPort = null;
var slapSpeed = 0;

function connectWeatherSerial() {
  weatherSerialPort = new serialport.SerialPort('/dev/tty' + SERIAL_PORT_SENSOR);

  weatherSerialPort.on('error', function () {
    console.error('sensors port: connecting failed ', SERIAL_PORT_SENSOR);
    sensorData.connected = false;

    setTimeout(connectWeatherSerial, 2000);
  });

  weatherSerialPort.on('open', function () {
    sensorData.connected = true;
    weatherSerialPort = null;
    console.info('sensors port: connected', SERIAL_PORT_SENSOR);
  });

  weatherSerialPort.on('data', function (rawData) {
    //console.info('sensors port: received data "', rawData.toString(), '"');
    sensorBuffer += rawData.toString();

    if (sensorBuffer.indexOf('#') !== -1) {
      var sensorBufferArray = sensorBuffer.split('#');
      var lastStr = sensorBufferArray[sensorBufferArray.length - 2];      
      //console.log(sensorBufferArray, lastStr);
      if (lastStr.split('-').length === 3) {
        var split = lastStr.split('-');
        sensorData.decibel = parseInt(split[0], 10);
        sensorData.luminosity = parseFloat(split[1], 10);
        sensorData.temperature = parseFloat(split[2], 10);  
        //console.log('process string', lastStr);
      }

      sensorBuffer = '';      
    }
  });
}

connectWeatherSerial();

// serial port handler for SLAP MACHINE
var slapMachineData = {
  connected: false
};

var slapSerialPort = null;

function connectSlapSerial() {
  
  slapSerialPort = new serialport.SerialPort('/dev/tty' + SERIAL_PORT_SLAP_MACHINE);

  slapSerialPort.on('error', function (err) {
    throw err;
    console.error('slap port: connecting failed ', SERIAL_PORT_SLAP_MACHINE);
    slapMachineData.connected = false;
    slapSerialPort = null;

    setTimeout(connectSlapSerial, 2000);
  });

  slapSerialPort.on('open', function () {
    slapMachineData.connected = true;
    console.info('slap port: connected', SERIAL_PORT_SLAP_MACHINE);
  });
}

connectSlapSerial();

setInterval(function () {
  if (slapSerialPort) {
    try { slapSerialPort.write(slapSpeed + '\0'); } catch(e) { console.log('WRITE FAIL');}
  }
}, 100);

// web application
var app = express();

app.use(bodyParser.json());

app.get('/sensors-data', function (req, res) {
  res.json(sensorData);
});

app.get('/slap-data', function (req, res) {
  res.json(slapMachineData);
});

app.post('/set-slap-speed', function (req, res) {
  //console.log('set slap speed', req.body, req.params);
  //if (slapSerialPort) {
  //  console.log('set slap speed', req.params.speed);
  //  slapSerialPort.write(req.params.speed + '');
  //}
  slapSpeed = req.body.speed;
  res.status(204).send('');
});

app.use(express.static('www'));
app.listen(8080);
console.log('listening http://localhost:8080');
