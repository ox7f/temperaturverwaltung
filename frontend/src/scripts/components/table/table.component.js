import template from './table.html';

class TableComponent {
    constructor(SocketService, DataService, SessionService, $scope) {
        this.Socket = SocketService;
        this.Session = SessionService;
        this.Data = DataService;
        this.$scope = $scope;

        // todo
        this.Session.login({name: 'test', password: 'test123'});
    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: TableComponent
};

export default TableComponent;