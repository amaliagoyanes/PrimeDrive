'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import SelectRefundUnits from '../../../src/components/popups/SelectRefundUnits';


it('renders correctly', () => {
    const tree = shallow(
        <SelectRefundUnits />);
    tree.setState({open: true, ticketLine: {units: 1}});
    expect(tree).toMatchSnapshot();
    expect(tree.find('AmountControl').length).toEqual(1)
});

it('renders correctly with multiple units)', () => {
    const tree = shallow(
        <SelectRefundUnits />);
    tree.setState({open: true, ticketLine: {units: 2}});
    expect(tree).toMatchSnapshot();
    expect(tree.find('AmountControl').length).toEqual(1)
});