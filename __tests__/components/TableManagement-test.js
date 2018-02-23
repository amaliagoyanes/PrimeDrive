'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import TableManagement from '../../src/components/TableManagement';


TableManagement.prototype.componentDidMount = jest.fn;
it('renders correctly', () => {
    const tree = shallow(
        <TableManagement />);
    expect(tree).toMatchSnapshot();
    expect(tree.find('TablesLayout').length).toEqual(1);
});

it('has required popups', () => {
    const tree = shallow(
        <TableManagement />);
    expect(tree.find('SideMenu').length).toEqual(1);
    expect(tree.find('OpenDay').length).toEqual(1);
    expect(tree.find('CloseDay').length).toEqual(1);
    expect(tree.find('CheckInOut').length).toEqual(1);
    expect(tree.find('SubProducts').length).toEqual(1);
    expect(tree.find('UserLogin').length).toEqual(1);
    expect(tree.find('TableNameChange').length).toEqual(1);
});

it('has navbar', () => {
    const tree = shallow(
        <TableManagement />);
    expect(tree.find('[name="navbar"]').length).toEqual(1);
});