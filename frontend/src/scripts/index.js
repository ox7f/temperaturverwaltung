import io from 'socket.io-client';
import angular from 'angular';
import ngRoute from 'angular-route';

import tableModule from './components/table';
import chartModule from './components/chart';
import userModule from './components/user';

let app = angular.module('app', [ngRoute, tableModule, chartModule, userModule]);

app.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/', {
        templateUrl: '/public/templates/main.html',
        controller: 'mainCtrl'
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
        redirectTo: '/'
    });
}]);

app.controller('loginCtrl', ['$scope', 'Socket', ($scope, Socket) => {
    let user = Socket.getUser();

    if (user) {
        // redirect to main
    }

    $scope.login = () => {
        Socket.login($scope.username, $scope.password);
    };
}]);

app.controller('mainCtrl', ['$scope', 'Socket', ($scope, Socket) => {
    let user = Socket.getUser();

    if (user) {
        // redirect to main
    } else {
        // redirect to login
    }

    console.log('mainCtrl');
}]);


app.controller('logoutCtrl', ['$scope', 'Socket', ($scope, Socket) => {
    console.log('logoutCtrl');
}]);

app.service('Socket', ['$location', function($location) {
    let socket = io(SOCKET_HOST);

    let entries = [];
    let users = [];
    let user = null;

    socket
    .on('login-success', (data) => {
        $location.path('/main');
        user = data;
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

    this.setEntries = (data) => {
        entries = data;
    };

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

    this.setUser = (data) => {
        user = dta;
    };

    this.getUser = () => {
        return user;
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
}]);

export default app;