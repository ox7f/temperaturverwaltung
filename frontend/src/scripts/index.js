import io from 'socket.io-client';
import angular from 'angular';
import Chart from 'chart.js/auto';

// https://www.chartjs.org/docs/latest/getting-started/usage.html
var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


import tableModule from './components/table';

let app = angular.module('app', [tableModule]);

// routing https://realpython.com/handling-user-authentication-with-angular-and-flask/#developing-the-angular-app

app.service('SessionService', function() {
    this.login = (name, password) => {
        return fetch(`http://${SOCKET_HOST}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: name,
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