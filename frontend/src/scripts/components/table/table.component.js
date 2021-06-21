import template from './table.html';

class TableComponent {
    constructor(Socket, $scope) {
        this.Socket = Socket;
        this.$scope = $scope;

        console.log('table component');
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: TableComponent
};
  
export default TableComponent;