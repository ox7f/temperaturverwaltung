import template from './sensor.html';

class SensorComponent {
    constructor($scope) {
        $scope.user = this.user;

        $scope.data = {
            sensor: this.sensor,
            hersteller: this.hersteller,
            temperatur: this.temperatur
        };

        $scope.openToolbox = this.toolbox;
        $scope.delete = this.delete;
        
        $scope.$watch(_ => this.delete, (newValue) => { $scope.delete = newValue; });
        $scope.$watch(_ => this.toolbox, (newValue) => { $scope.openToolbox = newValue; });

        $scope.$watch(_ => this.sensor, (newValue) => { $scope.data.sensor = newValue; });
        $scope.$watch(_ => this.hersteller, (newValue) => { $scope.data.hersteller = newValue; });
        $scope.$watchCollection(_ => this.temperatur, (newValue) => { $scope.data.temperatur = newValue; });
        $scope.$watchCollection(_ => this.user, (newValue) => { $scope.user = newValue; });
    }
}

export const SensorComponentDefinition = {
    restrict: 'E',
    bindings: {
        toolbox: '=',
        delete: '=',
        user: '=',
        sensor: '=',
        hersteller: '=',
        temperatur: '='
    },
    template,
    controller: SensorComponent
};
  
export default SensorComponent;