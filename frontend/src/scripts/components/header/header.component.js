import template from './header.html';

class HeaderComponent {
    constructor(Authenticator, $scope, $location) {
        $scope.user = JSON.parse(Authenticator.get('user'));
        
        $scope.$watch(_ => Authenticator.get('user'), (newValue) => {
            $scope.user = JSON.parse(newValue);
        });

        $scope.logout = _ => Authenticator.logout();

        $scope.toAdmin = _ => {
            $scope.$evalAsync(_ => {
                $location.path('admin');
            });
        };
    }
}

export const HeaderComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: HeaderComponent
};
  
export default HeaderComponent;