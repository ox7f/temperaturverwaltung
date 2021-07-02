import template from './chart.html';
import Chart from 'chart.js/auto';

class ChartComponent {
    constructor(Socket, $scope) {
        this.Socket = Socket;
        $scope.entries = Socket.getEntries();

        // https://www.chartjs.org/docs/latest/samples/scales/time-line.html
        new Chart(document.getElementById('chart'), {
            type: 'bar',
            data: {
                labels: $scope.entries.map(entry => entry.zeit.toLocaleTimeString()), // zeit-werte der entries
                datasets: [{
                    label: 'LABEL',
                    data: $scope.entries.map(entry => entry.temperatur), // temp-werte der entries
                    // backgroundColor: [],
                    // borderColor: [],
                    borderWidth: 1
                }]
            }
        });
    }
}

export const ChartComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: ChartComponent
};
  
export default ChartComponent;