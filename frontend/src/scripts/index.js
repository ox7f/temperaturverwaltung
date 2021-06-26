import io from 'socket.io-client';
import angular from 'angular';

import tableModule from './components/table';

let app = angular.module('app', [tableModule]);

app.service('SessionService', function() {
    let Service = this;

    Service.login = (data) => {  
        return fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(json => {
            console.log('loginCall', json);
        });
    };
    
    Service.logout = (data) => {
        return fetch(`${SOCKET_HOST}/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    };
});

app.service('SocketService', function() {
    let Service = this,
        socket = io(SOCKET_HOST);

    Service.getTableData = () => {
        socket
        .emit('get-table-data', (data) => {
            console.log('get-table-data', data);
        });
    };

    Service.getUsers = () => {
        socket
        .emit('get-users', (data) => {
            console.log('get-users', data);
        });
    };

    socket
    .on('table-data', (data) => {
        console.log('table-data', data);
    })
    .on('user-data', (data) => {
        console.log('user-data', data);
    })
    .on('temperature-added', (data) => {
        console.log('temperature-added', data);
    })
    .on('temperature-removed', (data) => {
        console.log('temperature-removed', data);
    });

    return Service;
});

app.service('DataService', function() {
    let Service = this;

    Service.addTemepratur = (data) => {
        return fetch(`${SOCKET_HOST}/api/addTemperatur`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    };

    Service.removeTemepratur = (data) => {
        return fetch(`${SOCKET_HOST}/api/removeTemperatur`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    };
});

export default app;