import angular from 'angular';
import ngRoute from 'angular-route';
import ngCookies from 'angular-cookies';

import io from 'socket.io-client';
import Chart from 'chart.js/auto';

let app = angular.module('app', [ngRoute, ngCookies]);

app.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/', {
        templateUrl: '/public/templates/main.html',
        controller: 'mainCtrl'
    })
    .when('/admin', {
        templateUrl: '/public/templates/admin.html',
        controller: 'adminCtrl'
    })
    .when('/login', {
        templateUrl: '/public/templates/login.html',
        controller: 'loginCtrl'
    })
    .when('/logout', {
        redirectTo: '/login',
        controller: 'logoutCtrl'
    })
    .otherwise({
        redirectTo: '/login'
    });
}]);

app.controller('mainCtrl', ['$scope', 'Socket', ($scope, Socket) => {
    console.log('mainCtrl');

    $scope.entries = Socket.getEntries();
    $scope.userEntries = Socket.getUserEntries();

    new Chart(document.getElementById('chart'), {
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
    });
}]);

app.controller('adminCtrl', ['$scope', 'Socket', ($scope, Socket) => {
    console.log('adminCtrl');

    $scope.users = Socket.getUserEntries();
}]);

app.controller('loginCtrl', ['$scope', '$cookies', 'Socket', ($scope, $cookies, Socket) => {
    console.log('loginCtrl');

    $scope.login = () => {
        fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: {
                name: $scope.username,
                password: $scope.password
            }
        })
        .then(res => res.json())
        .then(text => {
            console.log('login:', text);
            // $cookies.put(); cookie vom backend setzen?
        });
    };
}]);

app.controller('logoutCtrl', ['$scope', '$cookies', 'Socket', ($scope, $cookies, Socket) => {
    console.log('logoutCtrl');

    $scope.logout = () => {
        fetch(`http://${SOCKET_HOST}/api/logout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        })
        .then(res => res.json())
        .then(text => {
            console.log('logout', text);
            // $cookies.delete(); cookie löschen
        });
    };
}]);

app.service('Socket', ['$location', function($location) {
    let socket = io(SOCKET_HOST);

    // just test data
    let entries = [
        {id:1, sensorId:1, temperatur:29, zeit: new Date()},
        {id:2, sensorId:2, temperatur:39, zeit: new Date()},
        {id:3, sensorId:3, temperatur:59, zeit: new Date()}];
    let userEntries = [
        {id:1, username: 'test', telefonNr: '0213987148', admin: 0},
        {id:2, username: 'admin', telefonNr: '987249263', admin: 1}
    ];

    socket
    .on('users', (data) => {
        console.log('user-data', data);
        userEntries = data.data;
    })
    .on('data', (data) => {
        console.log('table-data', data);
        entries = data.data;
    })
    .on('temperature-added', (data) => {
        console.log('temperature-added', data);
        entries.push(data.data);
    })
    .on('temperature-removed', (data) => {
        console.log('temperature-removed', data);
        entries.splice(entries.indexOf(data.data), 1);
    });

    this.setEntries = (data) => {
        entries = data;
    };

    this.getEntries = () => {
        return entries;
    };

    this.setUserEntries = (data) => {
        userEntries = data;
    };

    this.getUserEntries = () => {
        return userEntries;
    };

    this.addEntry = (entry) => {
        entries.push(entry);
    };

    this.removeEntry = (entry) => {
        entries.splice(entries.indexOf(entry), 1);
    };

    this.getData = () => {
        socket.emit('get-data');
    };

    this.getUsers = () => {
        socket.emit('get-users');
    };

    return this;
}]);

export default app;