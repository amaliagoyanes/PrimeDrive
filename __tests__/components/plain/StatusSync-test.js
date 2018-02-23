'use strict';

import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import StatusSync from '../../../src/components/plain/StatusSync';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

StatusSync.prototype.componentDidMount = () => {};

it('renders correctly', () => {
    const tree = renderer.create(
        <StatusSync forceSync={jest.fn} userNumber={1}/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with client name', () => {
    const tree = renderer.create(
        <StatusSync forceSync={jest.fn} userNumber={1} client_name="Test client"/>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('renders correctly with number', () => {
    const tree = shallow(
        <StatusSync forceSync={jest.fn} userNumber={1}/>
    );
    tree.setState({number: 123});
    expect(tree).toMatchSnapshot();
});

it('renders correctly with number and client name', () => {
    const tree = shallow(
        <StatusSync forceSync={jest.fn} userNumber={1} client_name="Test client"/>
    );
    tree.setState({number: 123});
    expect(tree).toMatchSnapshot();
});
