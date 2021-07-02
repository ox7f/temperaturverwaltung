import template from './table.html';

class TableComponent {
    constructor(Socket, $scope) {
        $scope.entries = Socket.getEntries();

        $scope.params = this.params;
        $scope.$watch(_ => Socket.getEntries(), (newVal) => this.entries = newVal, true);
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: TableComponent
};
  
export default TableComponent;