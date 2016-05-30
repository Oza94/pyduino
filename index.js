var express = require('express');
var serialport = require('serialport');

var SERIAL_PORT = 'ACM0';
var sensorData = {
  connected: false,
  temperature: 0,
  distance: 0,
  luminosity: 0
};

// usb port communication
var serialPort = null;

function connectSerial() {
  serialPort = new serialport.SerialPort('/tty/' + SERIAL_PORT);

  serialPort.on('error', function () {
    console.error('serial port: failed to connect ', SERIAL_PORT);
    sensorData.connected = true;
    setTimeout(connectSerial, 2000);
  });

  serialPort.on('open', function () {
    sensorData.connected = false;
    serialPort = null;
    console.info('serial port: connected', SERIAL_PORT);
  });

  serialPort.on('data', function (rawData) {
    console.info('serial port: received data "', rawData, '"');
  });
}

connectSerial();

// web application
var app = express();

app.get('/sensors', function (req, res) {
  res.json(sensorData);
});

app.post('/set-slap-speed', function (req, res) {
  if (serialPort) {
    console.log('set slap speed', req.params.speed);
  }

  res.status(204).send('');
});

app.use(express.static('www'));
app.listen(8080);