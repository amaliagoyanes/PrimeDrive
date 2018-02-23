'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import {ReceiptItem} from '../../../../src/components/plain/receipts/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

let data = {
    timestamp: 1483228800,
    number: 123,
    total: 1200,
    discount: 20
};

it('renders correctly', () => {
    const tree = shallow(
        <ReceiptItem data={data} onPress={jest.fn}/>);
    expect(tree).toMatchSnapshot();
    expect(tree.find('ReceiptTotals').length).toEqual(1)
});

let data2 = {
    timestamp: 1483228800,
    number: 123,
    total: 1200,
    discount: 20,
    customer_name: 'Customer'
};
it('renders correctly with customer name', () => {
    const tree = shallow(
        <ReceiptItem data={data2} onPress={jest.fn}/>);
    expect(tree).toMatchSnapshot();
    expect(tree.find('ReceiptTotals').length).toEqual(1)
});
