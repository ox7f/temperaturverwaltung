import angular from 'angular';
import { LoginComponentDefinition } from './login.component';

export default angular
    .module('login-module', [])
    .component('login', LoginComponentDefinition)
    .name;