'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import CloseDay from '../../../src/components/popups/CloseDay';


it('renders correctly', () => {
    const tree = shallow(
        <CloseDay />);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('NumericKeyboard').length).toEqual(1);
    expect(tree.find('CashButton').length).toEqual(7);
    expect(tree.find('ButtonItem').length).toEqual(6);
});

it('has modal header and close button', () => {
    const tree = shallow(
        <CloseDay />);
    tree.setState({open: true});
    expect(tree.find('ModalCloseButton').length).toEqual(1);
    expect(tree.find('ModalHeader').length).toEqual(1);
});