'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import CheckInOut from '../../../src/components/popups/CheckInOut';


it('renders correctly', () => {
    const tree = shallow(
        <CheckInOut />);
    tree.setState({open: true, name: 'KASPER SJ', number: 1});
    expect(tree).toMatchSnapshot();
    expect(tree.find('ButtonItem').length).toEqual(2);
});

it('has modal header and close button', () => {
    const tree = shallow(
        <CheckInOut />);
    tree.setState({open: true, name: 'KASPER SJ', number: 1});
    expect(tree.find('ModalCloseButton').length).toEqual(1);
    expect(tree.find('ModalHeader').length).toEqual(1);
});

it('renders correctly active', () => {
    const tree = shallow(
        <CheckInOut />);
    tree.setState({open: true, uid: 1234, name: 'KASPER SJ', number: 1});
    expect(tree).toMatchSnapshot();
});

it('renders correctly timestamp', () => {
    const tree = shallow(
        <CheckInOut />);
    tree.setState({open: true, timestamp: Math.floor(Date.now() / 1000), name: 'KASPER SJ', number: 1});
    expect(tree).toMatchSnapshot();
});

it('renders correctly active with timestamp', () => {
    const tree = shallow(
        <CheckInOut />);
    tree.setState({open: true, uid: 1234, timestamp: Math.floor(Date.now() / 1000), name: 'KASPER SJ', number: 1});
    expect(tree).toMatchSnapshot();
});