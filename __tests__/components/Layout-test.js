'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import {Layout} from '../../src/components/Layout';


Layout.prototype.componentDidMount = jest.fn;

let state = {
    pages: {page_1: {name: 'page_1'}},
    buttons: {button_1: {name: 'button_1', product: 'product_1', gridNumber: 1, location_x: 1, location_y: 1}},
    products: {product_1: {name: 'product_1', price: 2}},
};

it('renders correctly', () => {
    const tree = shallow(
        <Layout />);
    expect(tree).toMatchSnapshot();
    expect(tree.find('withAnimation(ProgressCircle)').length).toEqual(1);

});

it('renders correctly with state', () => {
    const tree = shallow(
        <Layout />);
    tree.setState(state);
    expect(tree).toMatchSnapshot();
});


it('renders correctly with state (open day) and layouts name', () => {
    const tree = shallow(
        <Layout/>);
    tree.setState(state);
    tree.setState({layouts: {name: "Test layout"}, timestamp: 1483228800});
    expect(tree).toMatchSnapshot();
    expect(tree.find('SwipeALot').length).toEqual(1);
    expect(tree.find('TicketBlock').length).toEqual(1);
    expect(tree.find('NumberPopup').length).toEqual(1);
});

it('renders correctly with state (open day), layouts name and cash shift id', () => {
    const tree = shallow(
        <Layout cash_shift_id={1}/>);
    tree.setState(state);
    tree.setState({layouts: {name: "Test layout"}, timestamp: 1483228800});
    expect(tree).toMatchSnapshot();
    expect(tree.find('SwipeALot').length).toEqual(2);
    expect(tree.find('TicketBlock').length).toEqual(1);
    expect(tree.find('NumberPopup').length).toEqual(1);
});