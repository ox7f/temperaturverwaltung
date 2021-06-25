import io from 'socket.io-client';
import angular from 'angular';

import tableModule from './components/table';

let app = angular.module('app', [tableModule]);

app.service('Socket', ['$rootScope', '$window', ($rootScope, $window) => {
    let Service = this,
        socket = io(SOCKET_HOST);

   socket.on('connect', () => {
        socket.emit('connected', {msg: 'JAAAA, geile kacke!'});
    });

    return Service;
}]);

export default app;