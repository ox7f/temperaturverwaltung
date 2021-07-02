import template from './header.html';

class HeaderComponent {
    constructor(Authenticator, $scope) {
        $scope.user = Authenticator.get('user');
        $scope.$watch(_ => Authenticator.get('user'), (newVal) => $scope.user = newVal, true);
        $scope.logout = _ => Authenticator.logout();
    }
}

export const HeaderComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: HeaderComponent
};
  
export default HeaderComponent;