import template from './sensor.html';

class SensorComponent {
    constructor($scope, Socket) {
        this.allHersteller = [];
        this.allTemperatur = [];

        $scope.sensor = this.sensor;

        $scope.filteredTemperaturen = [];
        $scope.filteredHersteller = [];

        $scope.$watch(_ => this.sensor, (newValue) => {
            $scope.sensor = newValue;
        });

        $scope.$watchCollection(_ => Socket.get('temperatur'), (newValue) => {
            this.allTemperatur = newValue;
            getFilteredTemperaturen();
        });

        $scope.$watchCollection(_ =>  Socket.get('hersteller'), (newValue) => {
            this.allHersteller = newValue;
            getFilteredHersteller();
        });
        
        let getFilteredTemperaturen = _ => {
            $scope.filteredTemperaturen = this.allTemperatur.filter((t) => {
                return $scope.sensor.SensorID === t.SensorID;
            });
        };
    
        let getFilteredHersteller = _ => {
            $scope.filteredHersteller = this.allHersteller.filter((h) => {
                return $scope.sensor.HerstellerID === h.HerstellerID;
            });
        };
    }
}

export const SensorComponentDefinition = {
    restrict: 'E',
    bindings: {
        sensor: '='
    },
    template,
    controller: SensorComponent
};
  
export default SensorComponent;