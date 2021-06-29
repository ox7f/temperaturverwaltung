import io from 'socket.io-client';
import angular from 'angular';
import ngRoute from 'angular-route';

import tableModule from './components/table';

let app = angular.module('app', [ngRoute, tableModule]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '/public/templates/login.html',
    })
    .when('/login', {
        template: () => 'login',
        controller: 'loginCtrl'
    })
    .when('/logout', {
        // redirectTo: '/login'
        controller: 'logoutCtrl'
    })
    .when('/signup', {
        template: () => 'signup',
        controller: 'signupCtrl'
    })
    .otherwise({
        // redirectTo: '/'
    });
}]);

app.controller('loginCtrl', ['$scope', 'Socket', function($scope, Socket) {
    console.log('loginCtrl');
}]);

app.controller('logoutCtrl', ['$scope', 'Socket', function($scope, Socket) {
    console.log('logoutCtrl');
}]);

app.controller('signupCtrl', ['$scope', 'Socket', function($scope, Socket) {
    console.log('signupCtrl');
}]);

app.service('Socket', function() {
    let socket = io(SOCKET_HOST);

    let entries = [];
    let users = [];

    socket
    .on('login-success', (data) => {
        console.log('login-success', data);
    })
    .on('login-error', (data) => {
        console.log('login-error', data);
    })
    .on('users', (data) => {
        users = data.data;
        console.log('user-data', data);
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

    this.getEntries = () => {
        return entries;
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

    this.login = (name, password) => {
        socket.emit('login', {name: name, password: password});
    };

    this.logout = () => {
        socket.emit('logout');
    };

    return this;
});

export default app;