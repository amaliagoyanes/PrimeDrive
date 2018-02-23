'use strict';

import 'react-native';
import React from 'react';
import {ButtonItem} from '../../../../src/components/plain/buttons/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" active onPress={jest.fn}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with details text', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" detailsText="Details" onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active with details text', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" detailsText="Details" active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly modal active', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" modalActive style={{}} onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active, modal active', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" modalActive style={{}} active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly modal active with details', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" detailsText="Details" style={{}} modalActive onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly active, modal active with details', () => {
    const tree = renderer.create(
        <ButtonItem text="Button" detailsText="Details" style={{}} modalActive active onPress={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
});