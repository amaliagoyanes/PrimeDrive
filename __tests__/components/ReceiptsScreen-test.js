'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import ReceiptsScreen from '../../src/components/ReceiptsScreen';


ReceiptsScreen.prototype.componentDidMount = jest.fn;


it('renders correctly', () => {
    const tree = shallow(
        <ReceiptsScreen name="receipts"/>);
    expect(tree).toMatchSnapshot();
    expect(tree.find('Hideo').length).toEqual(1);
    expect(tree.find('ReceiptModal').length).toEqual(1);
    expect(tree.find('withAnimation(ProgressCircle)').length).toEqual(1);
});


it('renders correctly with data', () => {
    const tree = shallow(
        <ReceiptsScreen name="receipts"/>);
    tree.setState({data: [{}]});
    expect(tree).toMatchSnapshot();
    expect(tree.find('SwipeALot').length).toEqual(1);
    expect(tree.find('ReceiptItem').length).toEqual(1);
});


it('renders correctly with empty data', () => {
    const tree = shallow(
        <ReceiptsScreen name="receipts"/>);
    tree.setState({data: []});
    expect(tree).toMatchSnapshot();
});

