import template from './table.html';

class TableComponent {
    constructor($scope) {
        // TODO - filter bauen
        $scope.filterOptions = ['TemperaturID', 'Zeit', 'Temperatur'];

        $scope.filterChange = () => {
            $scope.$evalAsync();
            console.log('new filterSetting:', $scope.selectedFilter);
        };

        $scope.entries = this.ebntries;

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