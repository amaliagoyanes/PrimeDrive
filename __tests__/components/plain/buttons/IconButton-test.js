'use strict';

import 'react-native';
import React from 'react';
import {IconButton} from '../../../../src/components/plain/buttons/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <IconButton text="Button" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active', () => {
    const tree = renderer.create(
        <IconButton text="Button" active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with badge', () => {
    const tree = renderer.create(
         <IconButton text="Button" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active with badge', () => {
    const tree = renderer.create(
         <IconButton text="Button" active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with badge and status', () => {
    const tree = renderer.create(
         <IconButton text="Button" status onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active with badge and status', () => {
    const tree = renderer.create(
         <IconButton text="Button" status active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with badge, status, price', () => {
    const tree = renderer.create(
         <IconButton text="Button" price="10.55" status onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active with badge, status, price', () => {
    const tree = renderer.create(
         <IconButton text="Button" price="10.55" status active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with badge and price', () => {
    const tree = renderer.create(
         <IconButton text="Button" price="10.55" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active with badge and price', () => {
    const tree = renderer.create(
         <IconButton text="Button" price="10.55" active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active with badge, status, price, icon', () => {
    const tree = renderer.create(
         <IconButton text="Button" price="10.55" icon="access-point" status active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with badge, status, price, icon', () => {
    const tree = renderer.create(
         <IconButton text="Button" price="10.55" icon="access-point" status onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

