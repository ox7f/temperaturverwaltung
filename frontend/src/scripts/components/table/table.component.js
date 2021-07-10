import angular from 'angular';
import template from './table.html';

class TableComponent {
    constructor($scope, $location, Authenticator) {
        $scope.user = JSON.parse(Authenticator.get('user'));

        $scope.data = {
            sensor: this.sensor,
            temperatur: this.temperatur
        };

        $scope.path = $location.$$path;
        $scope.delete = this.delete;

        $scope.filterOptions = [
            {
                name: 'ID aufsteigend',
                label: 'TemperaturID',
                option: false
            },
            {
                name: 'ID absteigend',
                label: 'TemperaturID',
                option: true
            },
            {
                name: 'Zeit aufsteigend',
                label: 'Zeit',
                option: false
            },
            {
                name: 'Zeit absteigend',
                label: 'Zeit',
                option: true
            },
            {
                name: 'Temperatur aufsteigend',
                label: 'Temperatur',
                option: false
            },
            {
                name: 'Temperatur absteigend',
                label: 'Temperatur',
                option: true
            }
        ];

        $scope.limitOptions = [
            {
                name: 'Alles anzeigen',
                value: null
            },
            {
                name: '10 Einträge anzeigen',
                value: 10
            },
            {
                name: '50 Einträge anzeigen',
                value: 50
            },
            {
                name: '100 Einträge anzeigen',
                value: 100
            }
        ];

        $scope.$watch(_ => this.sensor, (newValue) => { $scope.data.sensor = newValue; });
        $scope.$watch(_ => this.delete, (newValue) => { $scope.delete = newValue; });

        $scope.$watchCollection(_ => this.temperatur, (newValue) => {
            $scope.data.temperatur = newValue.filter((nv) => nv.SensorID === $scope.data.sensor.SensorID);
        });
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {
        sensor: '=',
        temperatur: '=',
        delete: '='
    },
    template,
    controller: TableComponent
};
  
export default TableComponent;