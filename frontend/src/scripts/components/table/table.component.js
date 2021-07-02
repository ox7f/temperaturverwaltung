import template from './table.html';

class TableComponent {
    constructor(Socket, $scope) {
        $scope.entries = Socket.getEntries();
        $scope.$watch(_ => Socket.getEntries(), (newVal) => $scope.entries = newVal, true);
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: TableComponent
};
  
export default TableComponent;