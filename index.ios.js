import React from 'react';
import {AppRegistry} from 'react-native';

import PrimeDrive from './src/App.js';

import { Sentry } from 'react-native-sentry';


let env = process.env.NODE_ENV;
let dsn = '';
if (env === 'production') {
	dsn = 'http://b59ece0e102f41afbca11969c4cf5be7:99e8efa653a442cdae3052ab2e8249d9@sentry.milosolutions.com/58';
}
Sentry.config(dsn).install();

AppRegistry.registerComponent('PrimeDrive', () => PrimeDrive);
