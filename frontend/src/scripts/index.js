import angular from 'angular';
import ngRoute from 'angular-route';
import ngCookies from 'angular-cookies';

import io from 'socket.io-client';
import Chart from 'chart.js/auto';

let app = angular.module('app', [ngRoute, ngCookies]);

app.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/main', { templateUrl: '/public/templates/main.html', controller: 'mainCtrl' })
    .when('/admin', { templateUrl: '/public/templates/admin.html', controller: 'adminCtrl' })
    .when('/login', { templateUrl: '/public/templates/login.html', controller: 'loginCtrl' })
    .when('/logout', { redirectTo: '/login', controller: 'logoutCtrl' })
    .otherwise({ redirectTo: '/login' });
}]);

app.controller('mainCtrl', ['$scope', '$cookies', '$location', ($scope, $cookies, $location) => {
    console.log('cookie:', $cookies.get('logged_in'));

    if (!$cookies.get('logged_in'))
        $location.path('login');

    let socket = io(SOCKET_HOST);

    $scope.options = [1, 2, 3, 4, 5];
    $scope.entries = [];

    socket
    .emit('get-data', 'SelectTemperatur')
    .on('data', (data) => {
        console.log('table-data', data.data);
        $scope.$evalAsync(() => { 
            $scope.entries = data.data;
        });
    })
    .on('new-temperature', (data) => {
        console.log('new-temperature', data);
        $scope.entries.push(data.data);
    });

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

    $scope.selectChanged = () => socket.emit('get-data', 'SelectTemperatur');

    $scope.logout = () => {
        console.log('logout');
        $cookies.delete('logged_in');
        $location.path('login');
    };
}]);

app.controller('adminCtrl', ['$scope', '$cookies', '$location', ($scope, $cookies, $location) => {
    console.log('cookie:', $cookies.get('logged_in'));

    if (!$cookies.get('logged_in') || !$cookies.get('is_admin'))
        $location.path('login');

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
        $scope.$evalAsync(() => {
            $scope.userEntries = data.data;
        });
    })
    .on('data', (data) => {
        console.log('table-data', data);
        $scope.$evalAsync(() => {
            $scope.entries = data.data;
        });
    })
    .on('logs', (data) => {
        console.log('logs', data);
        $scope.$evalAsync(() => {
            $scope.logEntries = data;
        });
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

    $scope.addUser = (user) => socket.emit('add-user', user);
    $scope.changeSensor = (sensor) => socket.emit('changed-sensor', sensor);

    $scope.deleteTemperatur = (temperatur) => socket.emit('delete-temperatur', temperatur);
    $scope.deleteUser = (user) => socket.emit('delete-user', user);
    $scope.deleteLog = (log) => socket.emit('delete-log', log);

    $scope.logout = () => {
        console.log('logout');
        // $cookies.delete('name'); cookie löschen
        $location.path('login');
    };
}]);

app.controller('loginCtrl', ['$scope', '$cookies', '$location', ($scope, $cookies, $location) => {
    $scope.login = () => {
        fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: $scope.username, password: $scope.password})
        })
        .then(res => res.json())
        .then(json => {
            if (json.message === 'success') {
                if (json.data && json.data.Administrator)
                    $location.path('admin');
                else
                    $location.path('main');

                $cookies.put('logged_in', true);
            }
        });
    };
}]);

app.controller('logoutCtrl', ['$cookies', ($cookies) => {
    console.log('logout');
    $cookies.remove('logged_in');
}]);

export default app;