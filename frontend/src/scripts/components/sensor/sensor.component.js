import template from './sensor.html';

class SensorComponent {
    constructor($scope, Socket) {
        $scope.sensor = this.sensor;
        $scope.hersteller = this.hersteller;
        $scope.temperaturen = this.temperaturen;
        
        $scope.$watch(_ => this.sensor, (newValue) => {
            $scope.sensor = newValue;
        });

        $scope.$watch(_ => this.hersteller, (newValue) => {
            $scope.hersteller = newValue;
        });

        $scope.$watchCollection(_ => this.temperaturen, (newValue) => {
            $scope.temperaturen = newValue;
        });
    }
}

export const SensorComponentDefinition = {
    restrict: 'E',
    bindings: {
        sensor: '=',
        hersteller: '=',
        temperaturen: '='
    },
    template,
    controller: SensorComponent
};
  
export default SensorComponent;