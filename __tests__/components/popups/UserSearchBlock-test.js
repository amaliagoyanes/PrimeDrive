'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import UserSearchBlock from '../../../src/components/popups/UserSearchBlock';

UserSearchBlock.prototype.componentDidMount = jest.fn;

let state = {data: [{name: "Jens", number: 1}, {name: "Test", number: 2}]};

it('renders correctly', () => {
    const tree = shallow(
        <UserSearchBlock />);
    tree.setState(state);
    expect(tree).toMatchSnapshot();
    expect(tree.find('Hideo').length).toEqual(1);
    expect(tree.find('SwipeALot').length).toEqual(1);
});

it('filters correctly name', () => {
    const tree = shallow(
        <UserSearchBlock />);
    tree.setState(state);
    tree.setState({search: "Jens"});
    expect(tree).toMatchSnapshot();
});

it('filters correctly number', () => {
    const tree = shallow(
        <UserSearchBlock />);
    tree.setState(state);
    tree.setState({search: '1'});
    expect(tree).toMatchSnapshot();
});

