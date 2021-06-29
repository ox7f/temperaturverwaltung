import template from './user.html';

class UserComponent {
    constructor(Socket, $scope) {
        this.Socket = Socket;
        this.$scope = $scope;

        // todo
    }
}

export const UserComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: UserComponent
};

export default UserComponent;