'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import TablePicker from '../../../src/components/popups/TablePicker';


it('renders correctly', () => {
    const tree = shallow(
        <TablePicker />);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('TablesLayout').length).toEqual(1);
});

it('has modal header and close button', () => {
    const tree = shallow(
        <TablePicker />);
    tree.setState({open: true});
    expect(tree.find('ModalCloseButton').length).toEqual(1);
    expect(tree.find('ModalHeader').length).toEqual(1);
});