import angular from 'angular';
import { TableComponentDefinition } from './table.component';

export default angular
    .module('table-module', [])
    .component('table', TableComponentDefinition)
    .name;