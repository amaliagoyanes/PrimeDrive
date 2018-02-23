'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import NumberPopup from '../../../src/components/popups/NumberPopup';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = shallow(
        <NumberPopup />);
    tree.setState({open: true})
    expect(tree).toMatchSnapshot();
    expect(tree.find('NumericKeyboard').length).toEqual(1)

});

it('renders correctly with left arrow', () => {
    const tree = shallow(
        <NumberPopup arrow="left"/>);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
});

it('renders correctly with right arrow', () => {
    const tree = shallow(
        <NumberPopup arrow="right"/>);
    tree.setState({open: true});
    expect(tree).toMatchSnapshot();
});
