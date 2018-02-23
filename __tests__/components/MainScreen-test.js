'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import {MainScreen} from '../../src/components/MainScreen';


MainScreen.prototype.componentDidMount = jest.fn;

it('renders correctly', () => {
    const tree = shallow(
        <MainScreen uid={1}/>);
    tree.setState({cash_shift_id: 1, curTime: '11:11:11 - 01.01.2017'});
    expect(tree).toMatchSnapshot();
    expect(tree.find('StatusSync').length).toEqual(1);
    expect(tree.find('Connect(Layout)').length).toEqual(1);
});

it('has required popups', () => {
    const tree = shallow(
        <MainScreen uid={1}/>);
    tree.setState({cash_shift_id: 1});
    expect(tree.find('SideMenu').length).toEqual(1);
    expect(tree.find('OpenDay').length).toEqual(1);
    expect(tree.find('CloseDay').length).toEqual(1);
    expect(tree.find('CheckInOut').length).toEqual(1);
    expect(tree.find('SubProducts').length).toEqual(1);
    expect(tree.find('UserLogin').length).toEqual(1);
});

it('has navbar', () => {
    const tree = shallow(
        <MainScreen uid={1}/>);
    expect(tree.find('[name="navbar"]').length).toEqual(1);
});