'use strict';

import 'react-native';
import React from 'react';
import NumericKeyboard from '../../../src/components/plain/NumericKeyboard';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

let data = {name: 'Test', units: 1, product_price: 5};
it('renders correctly', () => {
    const tree = renderer.create(
        <NumericKeyboard />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with postfix', () => {
    const tree = renderer.create(
        <NumericKeyboard postifx="DKK"/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with delimiter', () => {
    const tree = renderer.create(
        <NumericKeyboard showDelimiter={true}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with delimiter and postfix', () => {
    const tree = renderer.create(
        <NumericKeyboard showDelimiter={true} postifx="DKK"/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly small block', () => {
    const tree = renderer.create(
        <NumericKeyboard smallBlock={true} />).toJSON();
    expect(tree).toMatchSnapshot();
});
