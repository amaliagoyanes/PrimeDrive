'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import OpenDay from '../../../src/components/popups/OpenDay';


it('renders correctly', () => {
    const tree = shallow(
        <OpenDay />);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('NumericKeyboard').length).toEqual(1);
    expect(tree.find('CashButton').length).toEqual(7);
    expect(tree.find('ButtonItem').length).toEqual(3);
});

it('has modal header and close button', () => {
    const tree = shallow(
        <OpenDay />);
    tree.setState({open: true});
    expect(tree.find('ModalCloseButton').length).toEqual(1);
    expect(tree.find('ModalHeader').length).toEqual(1);
});