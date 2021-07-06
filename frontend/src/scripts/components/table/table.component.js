import template from './table.html';

class TableComponent {
    constructor($scope) {
        // TODO - filter bauen
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
            if (value.Zeit.includes('-') || value.Zeit.includes('-')) {
                let date = new Date(value.Zeit);
                return date.getTime();
            }

            return Number(value[$scope.selectedFilter.label]);
        };

        $scope.entries = this.entries;

        $scope.$watchCollection(_ => this.entries, (newValue) => {
            $scope.entries = newValue;
        });
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {
        entries: '='
    },
    template,
    controller: TableComponent
};
  
export default TableComponent;