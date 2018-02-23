'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import UserLoginBlock from '../../../src/components/popups/UserLoginBlock';


it('renders correctly', () => {
    const tree = shallow(
        <UserLoginBlock />);
    expect(tree).toMatchSnapshot();
    expect(tree.find('NumericKeyboard').length).toEqual(1);
    expect(tree.find('ButtonItem').length).toEqual(2);
});

