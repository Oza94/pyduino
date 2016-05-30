
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
    $http.get('/sensors').then(function (res) {
      Object.keys(res.data).map(function (key) {
        vm[key] = res.data[key];
      });
    });
  };

  vm.activate();
});