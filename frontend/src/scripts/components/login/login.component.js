import template from './login.html';

class LoginComponent {
    constructor(Socket, SessionService, $scope) {

        this.Socket = Socket;
        this.$scope = $scope;

        this.Session = SessionService;
        
        this.username = NULL;
        this.password = NULL;

        console.log('login component');
        
        $scope.username;
        $scope.login = ()=> {
            if ($scope.username === NULL || $scope.username === '' || $scope.username.length <= 3){
                return;
            }        
        }

        $scope.password;
        $scope.login = ()=> {
            if ($scope.password === NULL || $scope.password === '' || $scope.password.length <= 8){
                return;
            }        
        }

    }
}

export const TableComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: LoginComponent
};
  
export default LoginComponent;