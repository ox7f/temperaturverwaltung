import template from './table.html';

class TableComponent {
    constructor($scope, Socket) {
        // TODO - Entries aktualisieren
        $scope.entries = [];

        $scope.$watchCollection(_ => Socket.get('temperatur'), (newValue) => {
            $scope.entries = newValue;
        });
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: TableComponent
};
  
export default TableComponent;