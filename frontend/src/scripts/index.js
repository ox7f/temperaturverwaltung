import angular from 'angular';
import ngRoute from 'angular-route';
import ngDialog from 'ng-dialog';

import io from 'socket.io-client';

import tableModule from './components/table';
import chartModule from './components/chart';
import headerModule from './components/header';

angular.module('app', [ngRoute, ngDialog, tableModule, chartModule, headerModule])

.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/main', { templateUrl: '/public/templates/main.html', controller: 'mainCtrl' })
    .when('/admin', { templateUrl: '/public/templates/admin.html', controller: 'adminCtrl' })
    .when('/login', { templateUrl: '/public/templates/login.html', controller: 'loginCtrl' })
    .when('/logout', { redirectTo: '/login', controller: 'logoutCtrl' })
    .otherwise({ redirectTo: '/login' });
}])

.controller('mainCtrl', ['$scope', 'Authenticator', 'Socket', ($scope, Authenticator, Socket) => {
    // TODO - session checken -> entsprechend routen
    
    // TODO - daten abrufen
    Socket.getData('SelectTemperatur');

}])

.controller('adminCtrl', ['$scope', 'ngDialog', 'Authenticator', 'Socket', ($scope, ngDialog, Authenticator, Socket) => {
    // TODO - session checken -> entsprechend routen

    $scope.openToolbox = (element, name) => {
        // TODO
        let copy = angular.copy(element);
        console.log('open Toolbox');
    };

    $scope.delete = (element, name) => {
        ngDialog.openConfirm({
            template: require('/public/templates/toast/confirm-delete.html'),
            disableAnimation: true,
            plain: true
        })
        .then(confirm => {
            socket.emit('remove-data', {data: element, name: name});
        })
        .catch(deny => { /* do nothing */});
    };

    $scope.add = (element, name) => {
        if (!angular.isDefined(element) || !angular.isDefined(name))
            return;

        console.log('add', {name:name, element:element});
        // socket.emit('add-data', {data: element, name: name});
    };
}])

.controller('loginCtrl', ['$scope', '$timeout', 'Authenticator', ($scope, $timeout, Authenticator) => {
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

            $timeout(_ => $scope.loginMessage = '', 3000);
        });
    };
}])

.controller('logoutCtrl', ['Authenticator', (Authenticator) => {
    Authenticator.logout();
}])

.service('Authenticator', ['$location', '$window', function($location, $window) {
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
}])

.service('Socket', ['$rootScope', function($rootScope) {
    let socket = io(SOCKET_HOST);

    let entries = {
        temperatur: [],
        log: [],
        benutzer: [],
        sensor: [],
        hersteller: []
    };

    socket
    .on('data', (data) => {
        console.log('socket get event', data);

        let name = data.name.replace('Select', '').toLowerCase();
        entries[name] = Object.values(data.data);

        $rootScope.$apply();
    })
    .on('added', (data) => {
        console.log('socket added event', data);

        if (data.message !== 'Success')
            return;

        let name = data.name.replace('Insert', '').toLowerCase();
        entries[name].push(data.new);

        $rootScope.$apply();
    })
    .on('modified', (data) => {
        console.log('socket changed event', data);

        if (data.message !== 'Success')
            return;

        let name = data.name.replace('Update', '').toLowerCase();
        entries[name][entries[data.name].indexOf(data.old)] = data.new;

        $rootScope.$apply();
    })
    .on('removed', (data) => {
        console.log('socket removed event', data);

        if (data.message !== 'Success')
            return;

        let name = data.name.replace('Delete', '').toLowerCase();
        entries[name].splice(entries[data.name].indexOf(data.old), 1);

        $rootScope.$apply();
    });

    this.getData = (name) => socket.emit('get-data', name);
    this.addData = (name, params) => socket.emit('add-data', {name: name, params: params});
    this.modifyData = (name, params) => socket.emit('modify-data', {name: name, params: params});
    this.removeData = (name, params) => socket.emit('remove-data', {name: name, params: params});

    this.getEntries = _ => entries;
    this.getLogEntries = _ => entries.log;
    this.getUserEntries = _ => entries.benutzer;
    this.getSensorEntries = _ => entries.sensor;
    this.getHerstellerEntries = _ => entries.hersteller;
    this.getTemperaturEntries = _ => entries.temperatur;

    return this;
}]);