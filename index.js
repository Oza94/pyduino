var express = require('express');
var bodyParser = require('body-parser');
var serialport = require('serialport');

var SERIAL_PORT_SENSOR = 'ACM1';
var SERIAL_PORT_SLAP_MACHINE = 'ACM0';

// serial port handler for SENSORS
var sensorData = {
  connected: false,
  temperature: 0,
  decibel: 0,
  luminosity: 0
};
var sensorBuffer = '';
var sensorsSerialPort = null;

// handle connection, disconnect, messages for SENSORS arduino
function connectSenorsSerial() {
  sensorsSerialPort = new serialport.SerialPort('/dev/tty' + SERIAL_PORT_SENSOR);

  sensorsSerialPort.on('error', function () {
    console.error('sensors port: connecting failed ', SERIAL_PORT_SENSOR);
    sensorData.connected = false;
    sensorsSerialPort = null;

    setTimeout(connectSenorsSerial, 2000);
  });

  sensorsSerialPort.on('open', function () {
    sensorData.connected = true;
    console.info('sensors port: connected', SERIAL_PORT_SENSOR);
  });

  sensorsSerialPort.on('data', function (rawData) {
    // each time we receive data we add it to our string buffer
    sensorBuffer += rawData.toString();

    // then the code below will test if we have a complete data chunk and
    // parse it
    if (sensorBuffer.indexOf('#') !== -1) {
      var sensorBufferArray = sensorBuffer.split('#');
      var lastStr = sensorBufferArray[sensorBufferArray.length - 2];      

      if (lastStr.split('-').length === 3) {
        var split = lastStr.split('-');
        sensorData.decibel = parseInt(split[0], 10);
        sensorData.luminosity = parseFloat(split[1], 10);
        sensorData.temperature = parseFloat(split[2], 10);  
      }

      sensorBuffer = '';      
    }
  });
}

connectSenorsSerial();

// serial port handler for SLAP MACHINE
var slapMachineData = {
  connected: false
};
var slapSpeed = 0;

var slapSerialPort = null;

// handle connection and disconnect for SLAP MACHINE serial
function connectSlapSerial() {
  
  slapSerialPort = new serialport.SerialPort('/dev/tty' + SERIAL_PORT_SLAP_MACHINE);

  slapSerialPort.on('error', function (err) {
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

// will send the current speed to arduino each 100ms
setInterval(function () {
  if (slapSerialPort) {
    try { 
      slapSerialPort.write(slapSpeed + '\0'); 
    } catch(e) { 
      console.log('failed to write on slap serial port', e.message);
    }
  }
}, 100);

// web application routes and API
var app = express();

app.use(bodyParser.json());

app.get('/sensors-data', function (req, res) {
  res.json(sensorData);
});

app.get('/slap-data', function (req, res) {
  res.json(slapMachineData);
});

app.post('/set-slap-speed', function (req, res) {
  slapSpeed = req.body.speed;
  res.status(204).send('');
});

app.use(express.static('www'));
app.listen(8080);
console.log('listening http://localhost:8080');
