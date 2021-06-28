import io from 'socket.io-client';
import angular from 'angular';

import tableModule from './components/table';

let app = angular.module('app', [tableModule]);

// routing https://realpython.com/handling-user-authentication-with-angular-and-flask/#developing-the-angular-app

app.service('SessionService', function() {
    this.login = (name, password) => {
        return fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user: name,
                password: password
            })
        })
        .then(response => response.json())
        .then(json => {
            console.log('loginCall', json);
        });
    };
    
    this.logout = (data) => {
        return fetch(`${SOCKET_HOST}/api/logout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(json => {
            console.log('logoutCall', json);
        });
    };

    return this;
});

app.service('SocketService', function() {
    let socket = io(SOCKET_HOST);

    this.getTableData = () => {
        socket.emit('get-table-data');
    };

    this.getUsers = () => {
        socket.emit('get-users');
    };

    socket
    .on('user-data', (data) => {
        console.log('user-data', data);
    })
    .on('table-data', (data) => {
        console.log('table-data', data);
    })
    .on('temperature-added', (data) => {
        console.log('temperature-added', data);
    })
    .on('temperature-removed', (data) => {
        console.log('temperature-removed', data);
    });

    return this;
});

app.service('DataService', function() {
    this.addTemepratur = data => {
        return fetch(`${SOCKET_HOST}/api/addTemperatur`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(json => {
            console.log('addTemepraturCall', json);
        });
    };

    this.removeTemepratur = data => {
        return fetch(`${SOCKET_HOST}/api/removeTemperatur`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(json => {
            console.log('removeTemepraturCall', json);
        });
    };

    return this;
});

export default app;