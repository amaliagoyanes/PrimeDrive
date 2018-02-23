'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import UserLogin from '../../../src/components/popups/UserLogin';


it('renders correctly', () => {
    const tree = shallow(
        <UserLogin />);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('UserSearchBlock').length).toEqual(1);
    expect(tree.find('UserLoginBlock').length).toEqual(1);
});

it('has modal header and close button', () => {
    const tree = shallow(
        <UserLogin />);
    tree.setState({open: true});
    expect(tree.find('ModalCloseButton').length).toEqual(1);
    expect(tree.find('ModalHeader').length).toEqual(1);
});