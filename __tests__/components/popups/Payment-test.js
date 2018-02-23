'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import Payment from '../../../src/components/popups/Payment';


it('renders correctly', () => {
    const tree = shallow(
        <Payment total={10}/>);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('NumericKeyboard').length).toEqual(1);
    expect(tree.find('ButtonItem').length).toEqual(5);
});

it('has modal header and close button', () => {
    const tree = shallow(
        <Payment total={10}/>);
    tree.setState({open: true});
    expect(tree.find('ModalCloseButton').length).toEqual(1);
    expect(tree.find('ModalHeader').length).toEqual(1);
});

it('renders correctly with card', () => {
    const tree = shallow(
        <Payment total={10}/>);
    tree.setState({open: true, card: 10});
    expect(tree).toMatchSnapshot();
    expect(tree.find('ButtonItem').length).toEqual(6);
});

it('renders correctly with cash', () => {
    const tree = shallow(
        <Payment total={10}/>);
    tree.setState({open: true, cash: 10});
    expect(tree).toMatchSnapshot();
    expect(tree.find('ButtonItem').length).toEqual(6);
});


it('renders correctly with currency', () => {
    const tree = shallow(
        <Payment total={10}/>);
    tree.setState({open: true, currency: 10});
    expect(tree).toMatchSnapshot();
    expect(tree.find('ButtonItem').length).toEqual(6);
});

it('renders correctly with giftCard', () => {
    const tree = shallow(
        <Payment total={10}/>);
    tree.setState({open: true, giftCard: 10});
    expect(tree).toMatchSnapshot();
    expect(tree.find('ButtonItem').length).toEqual(6);
});

it('counts balance correctly', () => {
    const tree = shallow(
        <Payment total={42}/>);
    tree.setState({open: true, card: 10, cash: 10, currency: 10, giftCard: 10});
    expect(tree.instance().getBalance()).toEqual("-2.00");
});
