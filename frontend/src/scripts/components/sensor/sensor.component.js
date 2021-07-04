import template from './sensor.html';

class SensorComponent {
    constructor($scope, Socket) {
        $scope.data = {
            sensor: this.sensor,
            hersteller: this.hersteller,
            temperatur: this.temperatur
        };
        
        $scope.$watch(_ => this.sensor, (newValue) => {
            $scope.data.sensor = newValue;
        });

        $scope.$watch(_ => this.hersteller, (newValue) => {
            $scope.data.hersteller = newValue;
        });

        $scope.$watchCollection(_ => this.temperatur, (newValue) => {
            $scope.data.temperatur = newValue;
        });
    }
}

export const SensorComponentDefinition = {
    restrict: 'E',
    bindings: {
        sensor: '=',
        hersteller: '=',
        temperatur: '='
    },
    template,
    controller: SensorComponent
};
  
export default SensorComponent;