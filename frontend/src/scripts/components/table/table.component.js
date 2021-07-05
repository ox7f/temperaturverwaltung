import template from './table.html';

class TableComponent {
    constructor($scope) {
        // TODO - filter bauen
        $scope.filter = null;
        $scope.filterOptions = [
            {},
            {},
            {}
        ];

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