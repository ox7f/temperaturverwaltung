import angular from 'angular';
import { ChartComponentDefinition } from './chart.component';

export default angular.module('chart-module', [])
.component('whkawsfChart', ChartComponentDefinition)
.name;