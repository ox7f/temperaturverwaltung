import template from './sensor.html';

class SensorComponent {
    constructor($scope) {
        $scope.hersteller = this.hersteller;
        $scope.entries = this.entries;
        $scope.sensor = this.sensor;

        $scope.$watch(_ => this.entries, (newValue) => {
            $scope.entries = newValue;
        }, true);

        $scope.$watch(_ => this.sensor, (newValue) => {
            $scope.sensor = newValue;
        }, true);

        $scope.$watch(_ => this.hersteller, (newValue) => {
            $scope.hersteller = newValue;
        }, true);
    }
}

export const SensorComponentDefinition = {
    restrict: 'E',
    bindings: {
        entries: '=',
        sensor: '=',
        hersteller: '='
    },
    template,
    controller: SensorComponent
};
  
export default SensorComponent;