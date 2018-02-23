'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import TicketLine from '../../../src/components/popups/TicketLine';


it('renders correctly', () => {
    const tree = shallow(
        <TicketLine />);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('AmountControl').length).toEqual(1);
    expect(tree.find('TicketLineControls').length).toEqual(1);
});

it('renders correctly with left arrow', () => {
    const tree = shallow(
        <TicketLine arrow="left"/>);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
});

it('renders correctly with right arrow', () => {
    const tree = shallow(
        <TicketLine arrow="right"/>);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
});

