
var module = angular.module('PyduinoApp', ['ngMaterial']);

module.controller('AppCtrl', function ($interval, $http) {
  var vm = this;

  vm.activate = function () {
    vm.slapSpeed = 0;
    vm.bunnyStyle = {
      bottom: '-530px'
    };
    vm.bgStyle = {
      background: 'rgba(26,35,126, 0)'
    };

    $interval(vm.tick, 100);
    $interval(vm.tickSlap, 1000);
  };

  vm.setSlapSpeed = function () {
    $http.post('/set-slap-speed', {
      speed: vm.slapSpeed
    });
  };

  vm.tick = function () {
    $http.get('/sensors-data').then(function (res) {
      vm.sensors = res.data;

      vm.bunnyStyle.bottom = '-' + (530 - vm.sensors.decibel) + 'px';

      var bgAlpha = 200 - (vm.sensors.luminosity > 200 ? 200 : vm.sensors.luminosity);
      bgAlpha /= 200;

      vm.bgStyle.background = 'rgba(26,35,126, ' + bgAlpha + ')';
    });
  };

  vm.tickSlap = function () {
    $http.get('/slap-data').then(function (res) {
      vm.slap = res.data;
    });
  };

  vm.activate();
});
