'use strict';

import 'react-native';
import React from 'react';
import {MenuItem} from '../../src/components/Layout';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <MenuItem  onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with text', () => {
    const tree = renderer.create(
        <MenuItem text="Menu Item" detailsText="Details" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with  price', () => {
    const tree = renderer.create(
        <MenuItem price="44,44" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with text and price', () => {
    const tree = renderer.create(
        <MenuItem text="Menu Item" price="44,44" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});
