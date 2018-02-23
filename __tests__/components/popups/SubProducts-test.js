'use strict';

import 'react-native';
import React from 'react';
import {ListView} from 'react-native';
import {shallow} from 'enzyme';
import SubProducts from '../../../src/components/popups/SubProducts';

let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
it('renders correctly', () => {
    const tree = shallow(
        <SubProducts />);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('ButtonItem').length).toEqual(5);
    expect(tree.find('SwipeALot').length).toEqual(1);
    expect(tree.find('IconButton').length).toEqual(48);
});

it('has modal header and close button', () => {
    const tree = shallow(
        <SubProducts />);
    tree.setState({open: true});
    expect(tree.find('ModalCloseButton').length).toEqual(1);
    expect(tree.find('ModalHeader').length).toEqual(1);
});
