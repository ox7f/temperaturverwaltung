import angular from 'angular';
import ngRoute from 'angular-route';
import ngCookies from 'angular-cookies';

import io from 'socket.io-client';
import Chart from 'chart.js/auto';

let app = angular.module('app', [ngRoute, ngCookies]);

app.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/', { templateUrl: '/public/templates/main.html', controller: 'mainCtrl' })
    .when('/admin', { templateUrl: '/public/templates/admin.html', controller: 'adminCtrl' })
    .when('/login', { templateUrl: '/public/templates/login.html', controller: 'loginCtrl' })
    .when('/logout', { redirectTo: '/login', controller: 'logoutCtrl' })
    .otherwise({ redirectTo: '/login' });
}]);

app.controller('mainCtrl', ['$scope', '$location', ($scope, $location) => {
    let socket = io(SOCKET_HOST);

    $scope.options = [1, 2, 3, 4, 5];
    $scope.entries = [];

    socket
    .emit('get-data', $scope.select)
    .on('data', (data) => {
        console.log('table-data', data);
        // $scope.entries = data.data;
    })
    .on('new-temperature', (data) => {
        console.log('new-temperature', data);
        $scope.entries.push(data.data);
    });

    // just test data
    let entries = [
        {id:1, sensorId:1, temperatur:29, zeit: new Date()},
        {id:2, sensorId:2, temperatur:39, zeit: new Date()},
        {id:3, sensorId:3, temperatur:59, zeit: new Date()}
    ];

    $scope.entries = entries;

    // https://www.chartjs.org/docs/latest/samples/scales/time-line.html
    /*new Chart(document.getElementById('chart'), {
        type: 'bar',
        data: {
            labels: $scope.entries.map(entry => entry.zeit.toLocaleTimeString()), // zeit-werte der entries
            datasets: [{
                label: 'LABEL',
                data: $scope.entries.map(entry => entry.temperatur), // temp-werte der entries
                // backgroundColor: [],
                // borderColor: [],
                borderWidth: 1
            }]
        }
    });*/

    $scope.selectChanged = () => socket.emit('get-data', $scope.select);

    $scope.logout = () => {
        console.log('logout');
        // $cookies.delete('name'); cookie löschen
        $location.path('/login');
    };
}]);

app.controller('adminCtrl', ['$scope', '$location', ($scope, $location) => {
    let socket = io(SOCKET_HOST);

    $scope.entries = [];
    $scope.userEntries = [];
    $scope.sensorEntries = [];
    $scope.logEntries = [];

    socket
    .emit('get-data', $scope.select)
    .emit('get-users')
    .on('users', (data) => {
        console.log('user-data', data);
        $scope.userEntries = data.data;
    })
    .on('data', (data) => {
        console.log('table-data', data);
        $scope.entries = data.data;
    })
    .on('logs', (data) => {
        console.log('logs', data);
        $scope.logEntries = data;
    })
    .on('user-removed', (data) => {
        console.log('user-removed', data);
        $scope.userEntries.splice($scope.userEntries.indexOf(data.data), 1);
    })
    .on('temperature-removed', (data) => {
        console.log('temperature-removed', data);
        $scope.entries.splice($scope.entries.indexOf(data.data), 1);
    })
    .on('sensor-change', (data) => {
        console.log('sensor-changed', data);
        $scope.sensorEntries[$scope.sensorEntries.indexOf(data.old)] = data.new;
    });

    // just test data
    userEntries = [
        {id:1, username: 'test', telefonNr: '0213987148', admin: 0},
        {id:2, username: 'admin', telefonNr: '987249263', admin: 1}
    ];

    $scope.users = userEntries;
    $scope.logs = logEntries;

    $scope.logout = () => {
        console.log('logout');
        // $cookies.delete('name'); cookie löschen
        $location.path('/login');
    };
}]);

app.controller('loginCtrl', ['$scope', '$cookies', '$location', ($scope, $cookies, $location) => {
    $scope.login = () => {
        fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: $scope.username,
                password: $scope.password
            })
        })
        .then(res => res.json())
        .then(text => {
            console.log('login:', text);
            // $cookies.put(); cookie vom backend setzen?
            $location.path('/main');
            // $location.path('/admin');
        });
    };
}]);

app.controller('logoutCtrl', ['$cookies', ($cookies) => {
    console.log('logout');
    // $cookies.delete(); cookie löschen
}]);

export default app;