'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import {AmountControl} from '../../../src/components/popups/TicketLine';


it('renders correctly', () => {
    const tree = shallow(
        <AmountControl />);
    expect(tree).toMatchSnapshot();
    expect(tree.find('TouchableOpacity').length).toEqual(3);
});

it('renders correctly with amount', () => {
    const tree = shallow(
        <AmountControl amount={2}/>);
    expect(tree).toMatchSnapshot();
});


it('value cannot be < 0', () => {
    const tree = shallow(
        <AmountControl/>);
    tree.find('[name="minus"]').simulate('press');
    expect(tree).toMatchSnapshot();
    expect(tree.instance().getVal()).toEqual(1);
});


it('value cannot be > maxAmount', () => {
    const tree = shallow(
        <AmountControl maxAmount={2}/>);
    tree.find('[name="plus"]').simulate('press');
    tree.find('[name="plus"]').simulate('press');
    expect(tree).toMatchSnapshot();
    expect(tree.instance().getVal()).toEqual(2);
});


