'use strict';

import 'react-native';
import React from 'react';
import {ButtonMeasures} from '../../../../src/components/plain/buttons/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <ButtonMeasures text="Button" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with details', () => {
    const tree = renderer.create(
        <ButtonMeasures text="Button" detailsText="Details" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});
