
var module = angular.module('PyduinoApp', ['ngMaterial']);

module.controller('AppCtrl', function ($interval, $http) {
  var vm = this;

  vm.activate = function () {
    vm.slapSpeed = 0;

    $interval(vm.tick, 500);
  };

  vm.setSlapSpeed = function () {
    $http.post('/set-slap-speed', {

    }).then(function (res) {

    });
  };

  vm.tick = function () {
    $http.get('/sensors-data').then(function (res) {
      vm.sensors = res.data;
    });

    $http.get('/slap-data').then(function (res) {
      vm.slap = res.data;
    });
  };

  vm.activate();
});