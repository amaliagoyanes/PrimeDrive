import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    View,
    ListView,
    Platform
} from 'react-native';
import Immersive from 'react-native-immersive';
import {Col, Row} from 'react-native-easy-grid';
import firestack from '../../fbconfig.js';
import {TableItem, ButtonItem} from '../index';
import {scale, scaleText} from '../../scaling';

import styles from '../../style/styles';

export default class TablesLayout extends Component {
    constructor(props) {
        super(props);

        this.state = {floors: [], tables: [], activeFloor: undefined};

        this.getFloors = this.getFloors.bind(this);
        this.getTables = this.getTables.bind(this);
    }

    getTableTypeButtonText(i) {
        switch (i) {
            case 0: return 'Free'; break;
            case 1: return 'Seated'; break;
            case 2: return 'Ordered'; break;
            case 3: return 'Starter'; break;
            case 4: return 'Main'; break;
            case 5: return 'Dessert'; break;
            case 6: return 'Check down'; break;
        }
    }

    getTableTypeButtonDetails(i) {
        switch (i) {
            case 0: return '12'; break;
            case 1: return '1'; break;
            case 2: return '1'; break;
            case 3: return '2'; break;
            case 4: return '3'; break;
            case 5: return '1'; break;
            case 6: return '1'; break;
        }
    }

    getTableStatusButtonBgColor(i) {
        switch (i) {
            case 'Free':
            case 0: return '#6f7076'; break;
            case 'Seated':
            case 1: return '#f52446'; break;
            case 'Ordered':
            case 2: return '#00d57d'; break;
            case 'Starter':
            case 3: return '#ffbb39'; break;
            case 'Main':
            case 4: return '#5083ff'; break;
            case 'Dessert':
            case 5: return '#ff59a3'; break;
            case 'Check down':
            case 6: return '#189bb5'; break;
        }
    }


    componentDidMount(){
        if (Platform.OS !== 'ios') {
            Immersive.on();
            Immersive.setImmersive(true);
        }
        this.getFloors();
    }

    componentDidUpdate(props, state) {
        if (state.activeFloor !== this.state.activeFloor)
            this.getTables();
    }

    getFloors() {
        if (this.state.floors !== undefined) {
            firestack.database.ref(`/floors/`).once('number').then((snapshot) => {
                let floors = snapshot.val();
                floors = Object.keys(floors).map(floor => {
                    return {...floors[floor], uid: floor}
                }).reverse();

                this.setState({floors: floors});
                console.log(floors)

                if (floors.length) {
                    this.setState({activeFloor: floors[0].uid});
                    this.getTables()
                }
            }).catch(err => console.log('failed get floors', err));
        }
    }

    getTables() {
        this.setState({tables: []});
        let extraFilter = this.props.extraFilter,
            orderBy = extraFilter ? 'floor_' + Object.keys(extraFilter).join('_'): 'floor',
            equalTo = extraFilter ? this.state.activeFloor + '~' + Object.values(extraFilter).join('~'): this.state.activeFloor;
        firestack.database.ref(`/tables/`).orderByChild(orderBy).equalTo(equalTo).once('name').then((snapshot) => {
            let tables = snapshot.val();
            if (tables) {
                tables = Object.keys(tables).map(table => {
                    return {...tables[table], uid: table}
                });
                if (tables.length)
                    this.setState({tables: tables});
            }
        }).catch(err => console.log('failed get tables', err));
    }

    render() {
        let perRow = 9,
            tablesLen = this.state.tables.length,
            rows = Math.ceil(tablesLen / perRow);
        return <Row size={20}>
            <Col>
                <Row size={1} style={{paddingLeft: scale(10)}}>
                    {this.state.floors.map((floor, i) =>
                        <ButtonItem key={i} textStyle={{fontSize: scaleText(8)}}
                                    onPress={() => this.setState({activeFloor: floor.uid})}
                                    text={'Floor ' + floor.number}
                                    active={floor.uid === this.state.activeFloor ? 'active' : '' }/>
                    )}
                </Row>
                <Row size={8} style={{paddingLeft: scale(10), paddingRight: scale(10)}}>
                    <Col style={styles.tablesLayout}>
                        {Array.apply(null, {length: rows}).map((d, idxRow) =>
                            <Row key={idxRow}>
                                {Array.apply(null, {length: perRow}).map((d, idxItem) => {
                                    let idx = idxRow * (perRow) + idxItem;
                                    if (idx < tablesLen) {
                                        let table = this.state.tables[idx];
                                        return <TableItem key={idxItem} num={table.name}
                                                          time={table.time ? table.time : undefined}
                                                          style={{backgroundColor: this.getTableStatusButtonBgColor(table.status)}}
                                                          onPress={() => this.props.onPress(table)}/>
                                    }
                                })}
                            </Row>
                        )}
                    </Col>
                </Row>
                {this.props.showTypeButtons &&
                <Row style={{paddingLeft: scale(10), paddingRight: scale(10)}}>
                    {Array.apply(null, {length: 7}).map((d, i) => {
                            return <ButtonItem key={i}
                                               style={[styles.buttonSidedText, {backgroundColor: this.getTableStatusButtonBgColor(i)}]}
                                               text={this.getTableTypeButtonText(i)}
                                               textStyle={{
                                                   fontSize: scaleText(8),
                                                   textAlign: 'left',
                                                   width: '50%'
                                               }}
                                               detailsText={this.getTableTypeButtonDetails(i)}/>
                        }
                    )}
                </Row>}
            </Col>
        </Row>
    }
}