'use strict';

import 'react-native';
import {Text} from 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import {ModalCloseButton, ModalHeader} from '../../../../src/components/plain/modals/plainComponents';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('ModalCloseButton renders correctly', () => {
    const tree = renderer.create(
        <ModalCloseButton close={jest.fn}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

ModalHeader.prototype.componentDidMount = () => {};
ModalHeader.prototype.getToday = () => '01.01.2017';
it('ModalHeader renders correctly', () => {
    const tree = shallow(
        <ModalHeader modalName={"TEST MODAL"}/>);
    tree.setState({curTime: '11:11:11'});
    expect(tree).toMatchSnapshot();
});
