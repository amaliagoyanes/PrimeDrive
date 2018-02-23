'use strict';

import 'react-native';
import React from 'react';
import {SectionHeader} from '../../../../src/components/plain/receipts/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <SectionHeader />).toJSON();
    expect(tree).toMatchSnapshot();
});