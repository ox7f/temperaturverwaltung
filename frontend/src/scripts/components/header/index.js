import angular from 'angular';
import { HeaderComponentDefinition } from './header.component';

export default angular.module('header-module', [])
.component('whkawsfHeader', HeaderComponentDefinition)
.name;