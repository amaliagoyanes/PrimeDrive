'use strict';

import 'react-native';
import React from 'react';
import ListViewRow from '../../../src/components/plain/ListViewRow';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

let data = {name: 'Test', units: 1, product_price: 5};
it('renders correctly', () => {
    const tree = renderer.create(
        <ListViewRow {...data} onDelete={jest.fn} onPress={jest.fn}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

let data2 = {name: 'Test', units: 1, product_price: 5, discount: '20'};
it('renders correctly with discount', () => {
    const tree = renderer.create(
        <ListViewRow {...data2} onDelete={jest.fn} onPress={jest.fn}/>).toJSON();
    expect(tree).toMatchSnapshot();
});
