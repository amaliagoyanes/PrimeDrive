'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import ActionConfirm from '../../../src/components/popups/ActionConfirm';


it('renders correctly', () => {
    const tree = shallow(
        <ActionConfirm />);
    tree.setState({open: true})
    expect(tree).toMatchSnapshot();
});
