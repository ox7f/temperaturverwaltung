import template from './header.html';

class HeaderComponent {
    constructor($scope, $location) {
        $scope.user = this.user;

        $scope.logout = _ => Authenticator.logout();

        $scope.toAdmin = _ => {
            $scope.$evalAsync(_ => {
                $location.path('admin');
            });
        };

        $scope.$watch(_ => this.user, (newValue) => { $scope.user = newValue; });
    }
}

export const HeaderComponentDefinition = {
    restrict: 'E',
    bindings: {
        user: '='
    },
    template,
    controller: HeaderComponent
};
  
export default HeaderComponent;