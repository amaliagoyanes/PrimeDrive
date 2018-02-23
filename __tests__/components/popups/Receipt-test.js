'use strict';

import 'react-native';
import React from 'react';
import {ListView} from 'react-native';
import { shallow } from 'enzyme';
import Receipt from '../../../src/components/popups/Receipt';

let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
it('renders correctly', () => {
    const tree = shallow(
        <Receipt />);
    tree.setState({
        open: true,
        number: 1,
        timestamp: 1483228800,
        data: ds.cloneWithRows([{uid: 1234, name: 'Test', units: 2, product_price: 3}])
    });
    expect(tree).toMatchSnapshot();
    expect(tree.find('Image').length).toEqual(2);
    expect(tree.find('IconButton').length).toEqual(2);
    expect(tree.find('SelectRefundUnits').length).toEqual(1);
    expect(tree.find('ListViewMock').length).toEqual(1);
    expect(tree.find('[name="credentials"]').length).toEqual(1);
});

it('return button works correctly', () => {
    const tree = shallow(
        <Receipt />);
    tree.setState({open: true, number: 1, timestamp: 1483228800});
    tree.find('[icon="redo-variant"]').simulate('press');
    expect(tree.instance().state.returnButtonPressed).toEqual(true);
    tree.find('[icon="redo-variant"]').simulate('press');
    expect(tree.instance().state.returnButtonPressed).toEqual(false);
});
