import io from 'socket.io-client';
import angular from 'angular';

import tableModule from './components/table';

let app = angular.module('app', [tableModule]);

// routing https://realpython.com/handling-user-authentication-with-angular-and-flask/#developing-the-angular-app
app.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '../index.html'
    })
    .when('/login', {
        templateUrl: '../index.html'
    })
    .when('/logout', {
        templateUrl: '../index.html'
    })
    .otherwise({
        redirectTo: '/'
    });
});


app.service('Socket', function() {
    let socket = io(SOCKET_HOST);

    let entries = [];

    socket
    .on('login-success', (data) => {
        console.log('login-success', data);
    })
    .on('login-error', (data) => {
        console.log('login-error', data);
    })
    .on('users', (data) => {
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