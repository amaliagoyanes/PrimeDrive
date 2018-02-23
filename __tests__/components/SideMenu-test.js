'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import SideMenu from '../../src/components/SideMenu';


SideMenu.prototype.componentDidMount = jest.fn;


it('renders correctly', () => {
    const tree = shallow(
        <SideMenu/>);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('IconButton').length).toEqual(33);
    expect(tree.find('SwipeALot').length).toEqual(1);
    expect(tree.find('Icon[name="close"]').length).toEqual(1);
});
