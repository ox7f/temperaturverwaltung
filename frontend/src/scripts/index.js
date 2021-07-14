import angular from 'angular';
import ngRoute from 'angular-route';
import ngDialog from 'ng-dialog';

import io from 'socket.io-client';

import tableModule from './components/table';
import headerModule from './components/header';
import sensorModule from './components/sensor';

angular.module('app', [ngRoute, ngDialog, tableModule, headerModule, sensorModule])

.config(['$routeProvider', ($routeProvider) => {
    $routeProvider
    .when('/main', { templateUrl: '/public/templates/main.html', controller: 'mainCtrl' })
    .when('/admin', { templateUrl: '/public/templates/admin.html', controller: 'adminCtrl' })
    .when('/login', { templateUrl: '/public/templates/login.html', controller: 'loginCtrl' })
    .when('/logout', { templateUrl: '/public/templates/logout.html', controller: 'logoutCtrl' })
    .otherwise({ redirectTo: '/login' });
}])

.controller('mainCtrl', ['$scope', '$location', 'Authenticator', 'Socket', ($scope, $location, Authenticator, Socket) => {
    $scope.user = JSON.parse(Authenticator.get('user'));
    $scope.data = {
        sensor: [],
        temperatur: [],
        hersteller: []
    };
    
    if (!$scope.user)
        $location.path('login');
    
    Socket.socketGet(['SelectSensor', 'SelectTemperatur', 'SelectHersteller']);

    $scope.$watchCollection(_ => Authenticator.get('user'), (newValue) => { $scope.user = JSON.parse(newValue); });
    $scope.$watchCollection(_ => Socket.get('Sensor'), (newValue) => { $scope.data.sensor = newValue; });
    $scope.$watchCollection(_ => Socket.get('Temperatur'), (newValue) => { $scope.data.temperatur = newValue; });
    $scope.$watchCollection(_ => Socket.get('Hersteller'), (newValue) => { $scope.data.hersteller = newValue; });
}])

.controller('adminCtrl', ['$scope', '$location', 'ngDialog', 'Authenticator', 'Socket', ($scope, $location, ngDialog, Authenticator, Socket) => {
    $scope.user = JSON.parse(Authenticator.get('user'));
    $scope.data = {
        user: [],
        sensor: [],
        temperatur: [],
        hersteller: [],
        log: []
    };
    $scope.new = {};

    if (!$scope.user)
        $location.path('login');

    if (!$scope.user.Administrator)
        $location.path('main');

    Socket.socketGet(['SelectTemperatur', 'SelectBenutzer', 'SelectSensor', 'SelectHersteller', 'SelectLog']);

    $scope.$watchCollection(_ => Authenticator.get('user'), (newValue) => { $scope.user = JSON.parse(newValue); });
    $scope.$watchCollection(_ => Socket.get('Benutzer'), (newValue) => { $scope.data.user = newValue; });
    $scope.$watchCollection(_ => Socket.get('Sensor'), (newValue) => { $scope.data.sensor = newValue; });
    $scope.$watchCollection(_ => Socket.get('Temperatur'), (newValue) => { $scope.data.temperatur = newValue; });
    $scope.$watchCollection(_ => Socket.get('Hersteller'), (newValue) => { $scope.data.hersteller = newValue; });
    $scope.$watchCollection(_ => Socket.get('Log'), (newValue) => { $scope.data.log = newValue; });

    $scope.openToolbox = (element, name) => {
        $scope.copy = angular.copy(element);
        $scope.copy['UserID'] = $scope.user['BenutzerID'];

        ngDialog.openConfirm({
            template: require('/public/templates/ngDialog/toolbox.html'),
            scope: $scope,
            plain: true,
        })
        .then(confirm => Socket.socketModify(name, $scope.copy))
        .catch(deny => { /* do nothing */});
    };

    $scope.delete = (element, name) => {
        ngDialog.openConfirm({
            template: require('/public/templates/ngDialog/confirm-delete.html'),
            scope: $scope,
            plain: true
        })
        .then(confirm => {
            element['UserID'] = $scope.user['BenutzerID'];
            Socket.socketRemove(name, element);
        })
        .catch(deny => { /* do nothing */});
    };

    $scope.add = (element, name) => {
        if (!angular.isDefined(element) || !angular.isDefined(name))
            return;

        element['UserID'] = $scope.user['BenutzerID'];

        Socket.socketAdd(name, element);
        $scope.new = {};
    };
}])

.controller('loginCtrl', ['$scope', '$location', '$timeout', 'Authenticator', ($scope, $location, $timeout, Authenticator) => {
    $scope.user = JSON.parse(Authenticator.get('user'));

    if ($scope.user)
        $location.path('main');

    $scope.login = (username, password) => {
        $scope.message = '';

        if (!angular.isDefined(username) || !angular.isDefined(password))
            return;

        $scope.isLoading = true;

        Authenticator.login(username, password)
        .then(user => {
            $scope.$evalAsync(_ => {
                if (user.message === "Success")
                    $location.path('main');

                $scope.message = 'Login Error - Check your credentials!';
            });

            $timeout(_ => $scope.message = '', 3000);
        });
    };
}])

.controller('logoutCtrl', ['$scope', '$location', 'Authenticator', ($scope, $location, Authenticator) => {
    Authenticator.logout();

    $scope.$evalAsync(_ => {
        $location.path('login');
    });
}])

.service('Authenticator', ['$location', '$window', function($location, $window) {
    let sessionStorage = $window.sessionStorage;

    this.login = (name, password) => {
        return fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ Anmeldename:name, Passwort:password })
        })
        .then(res => res.json())
        .then(user => {
            if (user.message === 'Success')
                this.set('user', user.data);

            return user;
        });
    };

    this.logout = _ => this.unset('user');

    this.get = (key) => sessionStorage.getItem(key);
    this.set = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));
    this.unset = (key) => sessionStorage.removeItem(key);

    return this;
}])

.service('Socket', ['$rootScope', 'Authenticator', function($rootScope, Authenticator) {
    let socket = io(SOCKET_HOST);

    let entries = {
        Temperatur: [],
        Log: [],
        Benutzer: [],
        Sensor: [],
        Hersteller: []
    };

    socket
    .on('data', (data) => {
        let name = data.name.replace('Select', '');
        entries[name] = Object.values(data.data);

        $rootScope.$apply();
    })
    .on('added', (data) => {
         if (data.message !== 'Success')
            return;

        let name = data.name.replace('Insert', '');
        entries[name].push(data.new);

        $rootScope.$apply();
    })
    .on('modified', (data) => {
        if (data.message !== 'Success')
            return;

        let name = data.name.replace('Update', '');

        entries[name].forEach((val, index) => {
            if (val[name+'ID'] === data.data[name+'ID'])
                entries[name][index] = data.data;
        });

        $rootScope.$apply();
    })
    .on('removed', (data) => {
        if (data.message !== 'Success')
            return;

        let name = data.name.replace('Delete', '');
        entries[name] = entries[name].filter((val) => val[name+'ID'] !== data.old[name+'ID']);

        $rootScope.$apply();
    });

    this.socketGet = (name) => socket.emit('get-data', name);
    this.socketAdd = (name, params) => { socket.emit('add-data', {name:name, params:params}); };
    this.socketModify = (name, params) => { socket.emit('modify-data', {name:name, params:params}); };
    this.socketRemove = (name, params) => { socket.emit('remove-data', {name:name, params:params}); };

    this.get = (key) => entries[key];

    return this;
}])

.filter('getHersteller', function() {
    return (data, sensor) => {
        return data.filter((d) => {
            return d.HerstellerID === sensor.HerstellerID;
        })[0];
    };
})

// todo - $digest - iteration error
.filter('getTemperatur', function() {
    return (data, sensor) => {
        return data.filter((d) => {
            return d.SensorID === sensor.SensorID;
        });
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
            if (d.SensorID === sensor.SensorID) {
                let wert = d.Temperatur;

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
            avgTemperatur;

        data.forEach((d) => {
            if (d.SensorID === sensor.SensorID) {
                let wert = d.Temperatur;
            
                total += wert;
                count++;
            }
        });

        avgTemperatur = total / count;
        avgTemperatur = Math.round(avgTemperatur * 100) / 100;

        return avgTemperatur + ' °C';
    };
});