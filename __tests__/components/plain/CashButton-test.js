'use strict';

import 'react-native';
import React from 'react';
import CashButton from '../../../src/components/plain/CashButton';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <CashButton text="Test"/>).toJSON();
    expect(tree).toMatchSnapshot();
});
