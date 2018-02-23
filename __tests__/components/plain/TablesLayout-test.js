'use strict';

import 'react-native';
import React from 'react';
import {shallow} from 'enzyme';
import TablesLayout from '../../../src/components/plain/TablesLayout';

// Note: test renderer must be required after react-native.


let state = {
    activeFloor: 'floor_1',
    floors: [{uid: 'floor_1', number: 1}, {uid: 'floor_2', number: 2}, {uid: 'floor_3', number: 3}],
    tables: [
        {
            "uid": "table_1",
            "floor": "floor_1",
            "floor_status": "floor_1~Free",
            "name": "1",
            "status": "Free"
        },
        {
            "uid": "table_2",
            "floor": "floor_1",
            "floor_status": "floor_1~Starter",
            "name": "2nd",
            "status": "Starter"
        },
        {
            "uid": "table_3",
            "floor": "floor_2",
            "floor_status": "floor_2~Check down",
            "name": "3",
            "status": "Check down"
        },
        {
            "uid": "table_4",
            "floor": "floor_1",
            "floor_status": "floor_1~Free",
            "name": 4,
            "status": "Free"
        }
    ]

};

TablesLayout.prototype.getFloors = jest.fn;
TablesLayout.prototype.getTables = jest.fn;
TablesLayout.prototype.componentDidMount = jest.fn;

it('renders correctly', () => {
    const tree = shallow(
        <TablesLayout />
    );
    tree.setState(state);
    expect(tree).toMatchSnapshot();
});

it('renders correctly with type buttons', () => {
    const tree = shallow(
        <TablesLayout showTypeButtons={true}/>
    );
    tree.setState(state);
    expect(tree).toMatchSnapshot();
});
//TODO: extraFilter


