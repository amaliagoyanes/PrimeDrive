'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import {TicketLineControls} from '../../../src/components/popups/TicketLine';


it('renders correctly', () => {
    const tree = shallow(
        <TicketLineControls active={0}/>);
    expect(tree).toMatchSnapshot();
    expect(tree.find('NumericKeyboard').length).toEqual(1);
});

it('renders correctly and isDiscount', () => {
    const tree = shallow(
        <TicketLineControls isDiscount={true}/>);
    expect(tree).toMatchSnapshot();
});


it('renders correctly active and isDiscount', () => {
    const tree = shallow(
        <TicketLineControls active={1} isDiscount={true}/>);
    expect(tree).toMatchSnapshot();
});


it('renders correctly readOnly', () => {
    const tree = shallow(
        <TicketLineControls readOnly={true}/>);
    expect(tree).toMatchSnapshot();
});

it('renders correctly readOnly and isDiscount', () => {
    const tree = shallow(
        <TicketLineControls readOnly={true} isDiscount={true}/>);
    expect(tree).toMatchSnapshot();
});

