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

app.controller('mainCtrl', ['$scope', 'authenticator', ($scope, authenticator) => {
    let socket = io(SOCKET_HOST);

    $scope.options = [1, 2, 3, 4, 5];
    $scope.entries = [];

    socket
    .emit('get-data', 'SelectTemperatur')
    .on('data', (data) => {
        console.log('table-data', data.data);
        $scope.$evalAsync(_ => { 
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

    $scope.selectChanged = _ => socket.emit('get-data', 'SelectTemperatur');

    $scope.logout = _ => authenticator.logout();
}]);

app.controller('adminCtrl', ['$scope', 'authenticator', ($scope, authenticator) => {
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

    $scope.openToolbox = (element) => {
        // todo
    };

    $scope.delete = (element, name) => {
        // todo: toast mit abfrage
        socket.emit(`remove-${name}`, element);
    };

    $scope.add = (element, name) => socket.emit(`add-${name}`, element);

    $scope.logout = _ => authenticator.logout();
}]);

app.controller('loginCtrl', ['$scope', '$timeout', 'authenticator', ($scope, $timeout, authenticator) => {
    $scope.loginMessage = '';
    $scope.isLoading = false;

    $scope.login = (username, password) => {
        if (!angular.isDefined(username) || username.length < 3 ||
            !angular.isDefined(password) || password.length < 3
        ) {
            return;
        }

        let loginPromise = authenticator.login(username, password);
        $scope.isLoading = true;

        loginPromise
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

app.controller('logoutCtrl', ['authenticator', (authenticator) => {
    authenticator.logout();
}]);

app.service('authenticator', ['$cookies', '$location', function ($cookies, $location) {
    let Service = this;
    let User = null;

    this.login = (name, password) => {
        return fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name, password: password })
        })
        .then(res => res.json())
        .then(json => {
            User = json.data[0];

            if (angular.isDefined(User) && User) {
                // todo: angular digest anstossen
                $location.path('main');

                $cookies.put('logged_in', true);
                $cookies.put('is_admin', !!Number(User['Administrator']));
            }

            return User;
        });
    };

    this.logout = _ => {
        $cookies.remove('logged_in');
        $cookies.remove('is_admin');
        $location.path('login');
    };

    this.isLogin = _ => $cookies.get('logged_in');
    this.isAdmin = _ => $cookies.get('is_admin');

    this.setUser = user => User = user;
    this.getUser = _ => User;

    return Service;
}]);

export default app;