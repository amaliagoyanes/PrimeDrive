'use strict';

import 'react-native';
import {Text} from 'react-native';
import React from 'react';
import {toFixedLocale, toLocale} from '../../../../src/components/plain/receipts/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('toLocale renders correctly', () => {
    const tree = renderer.create(
        <Text>{`${toLocale(1200)}`}</Text>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('toFixedLocale renders correctly', () => {
    const tree = renderer.create(
        <Text>{`${toFixedLocale(1200)}`}</Text>).toJSON();
    expect(tree).toMatchSnapshot();
});