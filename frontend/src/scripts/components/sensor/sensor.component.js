import template from './sensor.html';

class SensorComponent {
    constructor($scope, $location, Authenticator) {
        $scope.user = JSON.parse(Authenticator.get('user'));

        $scope.data = {
            sensor: this.sensor,
            hersteller: this.hersteller,
            temperatur: this.temperatur
        };

        $scope.path = $location.$$path;
        $scope.openToolbox = this.toolbox;
        $scope.delete = this.delete;

        $scope.$watch(_ => this.sensor, (newValue) => { $scope.data.sensor = newValue; });
        $scope.$watch(_ => this.hersteller, (newValue) => { $scope.data.hersteller = newValue; });

        $scope.$watch(_ => this.toolbox, (newValue) => { $scope.openToolbox = newValue; });
        $scope.$watch(_ => this.delete, (newValue) => { $scope.delete = newValue; });

        $scope.$watchCollection(_ => this.temperatur, (newValue) => { $scope.data.temperatur = newValue; });
        $scope.$watchCollection(_ => Authenticator.get('user'), (newValue) => { $scope.user = JSON.parse(newValue); });
    }
}

export const SensorComponentDefinition = {
    restrict: 'E',
    bindings: {
        sensor: '=',
        temperatur: '=',
        hersteller: '=',
        toolbox: '=',
        delete: '='
    },
    template,
    controller: SensorComponent
};
  
export default SensorComponent;