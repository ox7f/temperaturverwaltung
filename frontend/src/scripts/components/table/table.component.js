import template from './table.html';

class TableComponent {
    constructor($scope, Socket) {
        // TODO - Entries aktualisieren
        $scope.entries = [];

        $scope.$watch(_ => Socket.get('temperatur'), (newValue) => {
            $scope.entries = newValue;
        }, true);
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: TableComponent
};
  
export default TableComponent;