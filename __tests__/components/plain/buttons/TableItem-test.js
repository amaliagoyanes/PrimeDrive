'use strict';

import 'react-native';
import React from 'react';
import {TableItem} from '../../../../src/components/plain/buttons/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <TableItem num="1" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with time', () => {
    const tree = renderer.create(
        <TableItem num="1" time="10:45" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});