'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import Login from '../../src/components/Login';


Login.prototype.componentDidMount = jest.fn;
it('renders correctly', () => {
    const tree = shallow(
        <Login />);
    expect(tree).toMatchSnapshot();
    expect(tree.find('TextInput').length).toEqual(2);
    expect(tree.find('TouchableOpacity').length).toEqual(1);
});

it('renders correctly with error', () => {
    const tree = shallow(
        <Login />);
    tree.setState({error: true});
    expect(tree).toMatchSnapshot();
});