import angular from 'angular';
import { SensorComponentDefinition } from './sensor.component';

export default angular.module('sensor-module', [])
.component('whkawsfSensor', SensorComponentDefinition)
.name;