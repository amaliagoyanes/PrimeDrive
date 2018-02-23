'use strict';

import 'react-native';
import React from 'react';
import {ReceiptListViewFooter} from '../../../../src/components/plain/receipts/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <ReceiptListViewFooter total={1200} discount={{name: 'disc10', value: 120}}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with card', () => {
    const tree = renderer.create(
        <ReceiptListViewFooter total={1200} card="40003000****1000" discount={{name: 'disc10', value: 120}}/>).toJSON();
    expect(tree).toMatchSnapshot();
});