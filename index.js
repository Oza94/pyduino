var express = require('express');
var serialport = require('serialport');

var SERIAL_PORT_SENSOR = 'ACM0';
var SERIAL_PORT_SLAP_MACHINE = 'ACM2';

// serial port handler for WEATHER / SENSORS
var sensorData = {
  connected: false,
  temperature: 0,
  distance: 0,
  luminosity: 0
};

var weatherSerialPort = null;

function connectWeatherSerial() {
  weatherSerialPort = new serialport.SerialPort('/tty/' + SERIAL_PORT_SENSOR);

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
    console.info('sensors port: received data "', rawData, '"');
  });
}

connectWeatherSerial();

// serial port handler for SLAP MACHINE
var slapMachineData = {
  connected: false
};

var slapSerialPort = null;

function connectSlapSerial() {
  
  slapSerialPort = new serialport.SerialPort('/tty/' + SERIAL_PORT_SLAP_MACHINE);

  slapSerialPort.on('error', function () {
    console.error('slap port: connecting failed ', SERIAL_PORT_SLAP_MACHINE);
    slapMachineData.connected = false;

    setTimeout(connectSlapSerial, 2000);
  });

  slapSerialPort.on('open', function () {
    slapMachineData.connected = true;
    slapSerialPort = null;
    console.info('slap port: connected', SERIAL_PORT_SLAP_MACHINE);
  });
}

connectSlapSerial();

// web application
var app = express();

app.get('/sensors-data', function (req, res) {
  res.json(sensorData);
});

app.get('/slap-data', function (req, res) {
  res.json(slapMachineData);
});

app.post('/set-slap-speed', function (req, res) {
  if (weatherSerialPort) {
    console.log('set slap speed', req.params.speed);
  }

  res.status(204).send('');
});

app.use(express.static('www'));
app.listen(8080);
console.log('listening http://localhost:8080');