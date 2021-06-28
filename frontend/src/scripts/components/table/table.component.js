import template from './table.html';

class TableComponent {
    constructor(SocketService, $scope) {
        this.Socket = SocketService;
        this.$scope = $scope;

        // todo
        this.Socket.login('test', 'test123');
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: TableComponent
};

export default TableComponent;