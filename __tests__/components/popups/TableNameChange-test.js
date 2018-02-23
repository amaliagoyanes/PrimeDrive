'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import TableNameChange from '../../../src/components/popups/TableNameChange';


it('renders correctly', () => {
    const tree = shallow(
        <TableNameChange />);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
    expect(tree.find('TextInput').length).toEqual(1)
});