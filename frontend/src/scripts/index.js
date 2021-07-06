import angular from 'angular';
import ngRoute from 'angular-route';
import ngDialog from 'ng-dialog';

import io from 'socket.io-client';

import tableModule from './components/table';
import chartModule from './components/chart';
import headerModule from './components/header';

import sensorModule from './components/sensor';

angular.module('app', [ngRoute, ngDialog, tableModule, chartModule, headerModule, sensorModule])

.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/main', { templateUrl: '/public/templates/main.html', controller: 'mainCtrl' })
    .when('/admin', { templateUrl: '/public/templates/admin.html', controller: 'adminCtrl' })
    .when('/login', { templateUrl: '/public/templates/login.html', controller: 'loginCtrl' })
    .when('/logout', { redirectTo: '/login', controller: 'logoutCtrl' })
    .otherwise({ redirectTo: '/login' });
}])

.controller('mainCtrl', ['$scope', '$location', 'Authenticator', 'Socket', ($scope, $location, Authenticator, Socket) => {
    if (!Authenticator.get('user'))
        $location.path('login');

    if (Authenticator.get('user') && Authenticator.get('user') === 'undefined')
        $location.path('login');
    
    Socket.socketGet(['SelectSensor', 'SelectTemperatur', 'SelectHersteller']);

    $scope.path = $location.$$path;
    $scope.user = JSON.parse(Authenticator.get('user'));
    $scope.data = {
        sensor: [],
        temperatur: [],
        hersteller: []
    };

    $scope.$watchCollection(_ => Authenticator.get('user'), (newValue) => { $scope.user = JSON.parse(newValue); });
    $scope.$watchCollection(_ => Socket.get('sensor'), (newValue) => { $scope.data.sensor = newValue; });
    $scope.$watchCollection(_ => Socket.get('temperatur'), (newValue) => { $scope.data.temperatur = newValue; });
    $scope.$watchCollection(_ => Socket.get('hersteller'), (newValue) => { $scope.data.hersteller = newValue; });
}])

.controller('adminCtrl', ['$scope', '$location', 'ngDialog', 'Authenticator', 'Socket', ($scope, $location, ngDialog, Authenticator, Socket) => {
    if (!Authenticator.get('user'))
        $location.path('login');

    if (Authenticator.get('user') && Authenticator.get('user') === 'undefined')
        $location.path('login');

    if (Authenticator.get('user') && JSON.parse(Authenticator.get('user')).Administrator == 0)
        $location.path('main');

    Socket.socketGet(['SelectTemperatur', 'SelectBenutzer', 'SelectSensor', 'SelectHersteller', 'SelectLog']);

    $scope.path = $location.$$path;
    $scope.user = JSON.parse(Authenticator.get('user'));
    $scope.data = {
        user: [],
        sensor: [],
        temperatur: [],
        hersteller: [],
        log: []
    };

    $scope.$watchCollection(_ => Authenticator.get('user'), (newValue) => { $scope.user = JSON.parse(newValue); });
    $scope.$watchCollection(_ => Socket.get('benutzer'), (newValue) => { $scope.data.user = newValue; });
    $scope.$watchCollection(_ => Socket.get('sensor'), (newValue) => { $scope.data.sensor = newValue; });
    $scope.$watchCollection(_ => Socket.get('temperatur'), (newValue) => { $scope.data.temperatur = newValue; });
    $scope.$watchCollection(_ => Socket.get('hersteller'), (newValue) => { $scope.data.hersteller = newValue; });
    $scope.$watchCollection(_ => Socket.get('log'), (newValue) => { $scope.data.log = newValue; });

    $scope.openToolbox = (element, name) => {
        $scope.copy = angular.copy(element);

        ngDialog.openConfirm({
            template: require('/public/templates/ngDialog/toolbox.html'),
            scope: $scope,
            plain: true,
        })
        .then(confirm => Socket.socketModify(name, confirm))
        .catch(deny => { /* do nothing */});
    };

    $scope.delete = (element, name) => {
        ngDialog.openConfirm({
            template: require('/public/templates/ngDialog/confirm-delete.html'),
            scope: $scope,
            plain: true
        })
        .then(confirm => Socket.socketRemove(name, element))
        .catch(deny => { /* do nothing */});
    };

    $scope.add = (element, name) => {
        if (!angular.isDefined(element) || !angular.isDefined(name))
            return;

        Socket.socketAdd(name, element);
        $scope.new = {};
    };
}])

.controller('loginCtrl', ['$scope', '$location', '$timeout', 'Authenticator', ($scope, $location, $timeout, Authenticator) => {
    $scope.loginMessage = '';
    $scope.isLoading = false;

    $scope.login = (username, password) => {
        if (!angular.isDefined(username) || username.length < 3 || !angular.isDefined(password) || password.length < 3)
            return;

        $scope.isLoading = true;

        Authenticator.login(username, password)
        .then(user => {
            if (user)
                $location.path('main');

            $scope.$evalAsync(_ => {
                if (!user) {
                    $scope.isLoading = false;
                    $scope.loginMessage = 'Login fehlgeschlagen!';
                }
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

            if (angular.isDefined(user) && user)
                this.set('user', user);

            return user;
        });
    };

    this.logout = _ => {
        this.unset('user');
        $location.path('login');
    };

    this.get = (key) => sessionStorage.getItem(key);
    this.set = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));
    this.unset = (key) => sessionStorage.removeItem(key);

    return this;
}])

.service('Socket', ['$rootScope', 'Authenticator', function($rootScope, Authenticator) {
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
        let name = data.name.replace('Select', '').toLowerCase();
        entries[name] = Object.values(data.data);

        $rootScope.$apply();
    })
    .on('added', (data) => {
         if (data.message !== 'Success')
            return;

        let name = data.name.replace('Insert', '').toLowerCase();
        entries[name].push(data.new);

        $rootScope.$apply();
    })
    .on('modified', (data) => {
        if (data.message !== 'Success')
            return;

        let name = data.name.replace('Update', '').toLowerCase();

        entries[name] = entries[name].map((val) => {
            switch(name){
                case 'temperatur':
                    if (val.TemperaturID === data.data.TemperaturID)
                       return data.data;
                case 'log':
                    if (val.LogID === data.data.LogID)
                        return data.data;
                case 'hersteller':
                    if (val.HerstellerID === data.data.HerstellerID)
                        return data.data;
                case 'sensor':
                    if (val.SensorID === data.data.SensorID)
                        return data.data;
                case 'benutzer':
                    if (val.BenutzerID === data.data.BenutzerID)
                        return data.data;
            };

            return val;
        });

        if (name === 'benutzer' && data.data.BenutzerID === JSON.parse(Authenticator.get('user')).BenutzerID)
            Authenticator.set('user', data.data);

        $rootScope.$apply();
    })
    .on('removed', (data) => {
        if (data.message !== 'Success')
            return;

        let name = data.name.replace('Delete', '').toLowerCase();
        entries[name] = entries[name].filter((val) => {
            switch(name) {
                case 'temperatur':
                    return val.TemperaturID !== data.old.TemperaturID;
                case 'log':
                    return val.LogID !== data.old.LogID;
                case 'hersteller':
                    return val.HerstellerID !== data.old.HerstellerID;
                case 'sensor':
                    return val.SensorID !== data.old.SensorID;
                case 'benutzer':
                    return val.BenutzerID !== data.old.BenutzerID;
            };
        });

        $rootScope.$apply();
    });

    this.socketGet = (name) => socket.emit('get-data', name);
    this.socketAdd = (name, params) => socket.emit('add-data', {name: name, params: params});
    this.socketModify = (name, params) => socket.emit('modify-data', {name: name, params: params});
    this.socketRemove = (name, params) => socket.emit('remove-data', {name: name, params: params});

    this.get = (key) => entries[key];

    return this;
}])

.filter('custom', function() {
    return (data, sensor) => {
        return data.filter((d) => {
            return d.HerstellerID === sensor.HerstellerID;
        })[0];
    };
})

.filter('greatest', function() {
    return (data, sensor) => {
        data = data.filter((d) => {
            return d.SensorID === sensor.SensorID;
        });

        if (!angular.isDefined(data) || data.length === 0)
            return 'Keine Messwerte!';

        let maxTemperatur = 0;

        data.forEach((d) => {
            if (!angular.isDefined(d) || !angular.isDefined(d.Temperatur))
                return;

            if (d.SensorID === sensor.SensorID) {
                let wert = Number(d.Temperatur);

                if (wert > maxTemperatur)
                    maxTemperatur = wert;
            }
        });

        maxTemperatur = Math.round(maxTemperatur * 100) / 100;

        return maxTemperatur + ' °C';
    };
})

.filter('average', function() {
    return (data, sensor) => {
        data = data.filter((d) => {
            return d.SensorID === sensor.SensorID;
        });

        if (!angular.isDefined(data) || data.length === 0)
            return 'Keine Messwerte!';

        let total = 0,
            count = 0,
            avgTemperatur = 0;

        data.forEach((d) => {
            if (!angular.isDefined(d) || !angular.isDefined(d.Temperatur))
                return;

            if (d.SensorID === sensor.SensorID) {
                let wert = Number(d.Temperatur);
            
                total += wert;
                count++;
            }
        });

        avgTemperatur = total / count;
        avgTemperatur = Math.round(avgTemperatur * 100) / 100;

        return avgTemperatur + ' °C';
    };
});