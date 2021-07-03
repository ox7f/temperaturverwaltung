import Chart from 'chart.js/auto';

import template from './chart.html';

class ChartComponent {
    constructor($scope, Socket) {
        // TODO - Entries aktualisieren
        $scope.$watch(_ => Socket.getTemperaturEntries(), (newValue) => {
            // TODO - https://www.chartjs.org/docs/master/developers/updates.html
            this.updateChart(newValue);
        });
    }

    updateChart(entries) {
        // https://www.chartjs.org/docs/latest/samples/scales/time-line.html
        new Chart(document.getElementById('chart'), {
            type: 'bar',
            data: {
                labels: entries.map(entry => new Date(entry.Zeit).toLocaleTimeString()), // zeit-werte der entries
                datasets: [{
                    label: 'LABEL',
                    data: entries.map(entry => entry.Temperatur), // temp-werte der entries
                    backgroundColor: ['green'],
                    borderColor: [],
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