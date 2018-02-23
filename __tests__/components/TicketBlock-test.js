'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import TicketBlock from '../../src/components/TicketBlock';


TicketBlock.prototype.componentDidMount = jest.fn;

let dataSource = [{product_price: 1, units: 2, name: "Test"}],
    functions = [{name: "Test func", uid: 1234, functionKey: 'K'}];

it('renders correctly', () => {
    const tree = shallow(
        <TicketBlock dataSource={dataSource} ticketData={{}} functions={functions}/>);
    expect(tree).toMatchSnapshot();
    expect(tree.find('IconButton').length).toEqual(1);
    expect(tree.find('SwipeALot').length).toEqual(1);
    expect(tree.find('Icon[name="close"]').length).toEqual(1);
    expect(tree.find('ButtonMeasures').length).toEqual(2);
    expect(tree.find('ButtonItem[text="Select table"]').length).toEqual(1);
    expect(tree.find('ButtonItem[text="Pay"]').length).toEqual(1);
});

it('has required popups', () => {
    const tree = shallow(
        <TicketBlock dataSource={dataSource} ticketData={{}} functions={functions}/>);
    expect(tree.find('TicketLine').length).toEqual(1);
    expect(tree.find('NumberPopup').length).toEqual(2);
    expect(tree.find('Payment').length).toEqual(1);
    expect(tree.find('TablePicker').length).toEqual(1);
    expect(tree.find('ActionConfirm').length).toEqual(3);
});

