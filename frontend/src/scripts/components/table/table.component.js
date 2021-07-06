import angular from 'angular';
import template from './table.html';

class TableComponent {
    constructor($scope) {
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

        $scope.customOrderBy = (value) => {
            if (!angular.isDefined(value) || !value || value === null)
                return;

            if (typeof value[$scope.selectedFilter.label] === 'number')
                return value;

            if (value[$scope.selectedFilter.label].includes('-') || value[$scope.selectedFilter.label].includes('-')) {
                let date = new Date(value.Zeit);
                return date.getTime();
            }

            return Number(value[$scope.selectedFilter.label]);
        };

        $scope.isAdmin = !!Number(this.user);
        $scope.sensor = this.sensor;
        $scope.entries = this.entries;
        $scope.delete = this.delete;

        $scope.$watch(_ => this.user, (newValue) => { $scope.isAdmin = !!Number(newValue); });
        $scope.$watch(_ => this.sensor, (newValue) => { $scope.sensor = newValue; });
        $scope.$watch(_ => this.delete, (newValue) => { $scope.delete = newValue; });
        $scope.$watchCollection(_ => this.entries, (newValue) => { $scope.entries = newValue; });
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {
        delete: '=',
        entries: '=',
        user: '=',
        sensor: '='
    },
    template,
    controller: TableComponent
};
  
export default TableComponent;