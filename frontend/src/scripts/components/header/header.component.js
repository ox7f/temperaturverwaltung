import template from './header.html';

class HeaderComponent {
    constructor($scope, Authenticator) {
        $scope.user = JSON.parse(Authenticator.get('user'));

        $scope.$watch(_ => Authenticator.get('user'), (newValue) => { $scope.user = JSON.parse(newValue); });
    }
}

export const HeaderComponentDefinition = {
    restrict: 'E',
    bindings: {},
    template,
    controller: HeaderComponent
};
  
export default HeaderComponent;