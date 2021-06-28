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

app.service('SocketService', function() {
    let socket = io(SOCKET_HOST);

    this.getTableData = () => {
        socket.emit('get-table-data');
    };

    this.getUsers = () => {
        socket.emit('get-users');
    };

    this.login = (name, password) => {
        socket.emit('login', {name: name, password: password});
    };

    this.logout = (name, password) => {
        socket.emit('logout');
    };

    socket
    .on('login-success', (data) => {
        console.log('login-success', data);
    })
    .on('login-error', (data) => {
        console.log('login-error', data);
    })
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

export default app;