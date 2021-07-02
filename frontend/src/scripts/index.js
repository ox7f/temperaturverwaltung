import angular from 'angular';
import ngRoute from 'angular-route';
import ngDialog from 'ng-dialog';

import io from 'socket.io-client';

import tableModule from './components/table';
import chartModule from './components/chart';
import headerModule from './components/header';

let app = angular.module('app', [ngRoute, ngDialog, tableModule, chartModule, headerModule]);

app.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/main', { templateUrl: '/public/templates/main.html', controller: 'mainCtrl' })
    .when('/admin', { templateUrl: '/public/templates/admin.html', controller: 'adminCtrl' })
    .when('/login', { templateUrl: '/public/templates/login.html', controller: 'loginCtrl' })
    .when('/logout', { redirectTo: '/login', controller: 'logoutCtrl' })
    .otherwise({ redirectTo: '/login' });
}]);

app.controller('mainCtrl', ['$scope', 'Authenticator', 'Socket', ($scope, Authenticator, Socket) => {
    // TODO - session checken -> entsprechend routen

    // TODO - options anpassen -> /backend/query.json
    $scope.options = [1, 2, 3, 4, 5];

    $scope.selectChanged = () => {
        // TODO - entries holen
        Socket.getData('todo - name', $scope.options);
    };
}]);

app.controller('adminCtrl', ['$scope', 'ngDialog', 'Authenticator', 'Socket', 'Toolbox', ($scope, ngDialog, Authenticator, Socket, Toolbox) => {
    // TODO - session checken -> entsprechend routen

    $scope.openToolbox = (element, name) => {
        let copy = angular.copy(element);

        Toolbox
        .open(copy, name)
        .then(data => element = data);
    };

    $scope.delete = (element, name) => {
        console.log('remove', name, element);

        ngDialog.openConfirm({
            template: require('/public/templates/toast/confirm-delete.html'),
            plain: true
        })
        .then(confirm => {
            console.log('yes', confirm);
            // socket.emit('remove', {data: element, name: name});
        })
        .catch(deny => {
            console.log('no', deny);
            // nichts machen
        });
    };

    $scope.add = (element, name) => {
        console.log('add', name, element);
        // socket.emit('add', {data: element, name: name});
    };
}]);

app.controller('loginCtrl', ['$scope', '$timeout', 'Authenticator', ($scope, $timeout, Authenticator) => {
    $scope.loginMessage = '';
    $scope.isLoading = false;

    $scope.login = (username, password) => {
        if (!angular.isDefined(username) || username.length < 3 || !angular.isDefined(password) || password.length < 3)
            return;

        $scope.isLoading = true;

        Authenticator.login(username, password)
        .then(user => {
            if (user)
                return;

            $scope.$evalAsync(_ => {
                $scope.isLoading = false;
                $scope.loginMessage = 'Login fehlgeschlagen!';
            });

            $timeout(_ => $scope.loginMessage = '', 5000);
        });
    };
}]);

app.controller('logoutCtrl', ['Authenticator', (Authenticator) => {
    Authenticator.logout();
}]);

app.service('Authenticator', ['$location', '$window', function ($location, $window) {
    let sessionStorage = $window.sessionStorage;

    this.login = (name, password) => {
        return fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name, password: password })
        })
        .then(res => res.json())
        .then(json => {
            let user = json.data[0];

            if (angular.isDefined(user) && user) {
                // todo: angular digest anstossen
                $location.path('main');

                this.set('user', user);
            }

            return user;
        });
    };

    this.logout = _ => {
        this.unset('user');

        $location.path('login');
    };

    this.get = (key) => JSON.parse(sessionStorage.getItem(key));
    this.set = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));
    this.unset = (key) => sessionStorage.removeItem(key);

    return this;
}]);

app.service('Socket', ['$filter', function ($filter) {
    let socket = io(SOCKET_HOST);
    let entries = [],
        logEntries = [],
        userEntries = [],
        sensorEntries = [];

    // todo
    socket
    .on('get', (data) => {
        console.log('socket get event', data);
    })
    .on('new', (data) => {
        console.log('socket new event', data);
    })
    .on('changed', (data) => {
        console.log('socket changed event', data);
    })
    .on('removed', (data) => {
        console.log('socket removed event', data);
    });

    this.getData = (name, params) => socket.emit('get-data', {name: name, params: params});

    this.getEntries = _ => entries;
    this.getLogEntries = _ => logEntries;
    this.getUserEntries = _ => userEntries;
    this.getSensorEntries = _ => sensorEntries;

    return this;
}]);

app.service('Toolbox', ['ngDialog', function (ngDialog) {
    this.open = (element) => {
        let promise = new Promise(/* TODO */);

        return promise;
    };

    return this;
}]);

export default app;