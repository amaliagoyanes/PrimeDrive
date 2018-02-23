'use strict';

import 'react-native';
import React from 'react';
import {ReceiptTotals} from '../../../../src/components/plain/receipts/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <ReceiptTotals total={1200}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly small', () => {
    const tree = renderer.create(
        <ReceiptTotals small={true} total={1200}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly discount', () => {
    const tree = renderer.create(
        <ReceiptTotals total={1200} discount={20}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly small, discount', () => {
    const tree = renderer.create(
        <ReceiptTotals small={true} total={1200}  discount={20}/>).toJSON();
    expect(tree).toMatchSnapshot();
});