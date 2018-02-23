import React, {Component} from 'react';
import moment from 'moment';
import {
    Dimensions,
    TouchableOpacity,
    Text, FlatList,
    View, Alert,
    NativeModules,
    DeviceEventEmitter
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import * as Progress from 'react-native-progress';
// import { getTagId, init } from 'react-native-acr-reader';

import {ButtonItem, TwoTextButtonItem, ModalHeader, ModalCloseButton} from '../index';

import {fetchData} from '../../api';
import styles from '../../style/styles';
import {scale} from '../../scaling';
import firestack from '../../fbconfig.js';


export default class Scanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, loaded: true, active: '', active_name: 'app.all', search: '', types: {}, scans: {}, chips: {}
        };
        this.modalName = 'app.scan_card_wristband';

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.scan_chip = this.scan_chip.bind(this);
        this.getItems = this.getItems.bind(this);
        this.loadData = this.loadData.bind(this);
        this.setActive = this.setActive.bind(this);
        this.clear_scanning = this.clear_scanning.bind(this);
    }

    setActive(key) {
        this.setState({active: key, active_name: this.state.types[key].name});
    }

    loadData() {
        let dataRelations = [
            {firebaseRoot: 'products', 'name': 'products'},
            {firebaseRoot: 'productsType', 'name': 'types'},
        ];
        let itemsProcessed = 0;
        let state = {};
        dataRelations.forEach((relation, i) => {
            fetchData(relation.firebaseRoot).then(result => {
                result = Object.keys(result).map(key => {
                    return {...result[key], key: key};
                });
                state[relation.name] = result;
                itemsProcessed++;
                if (itemsProcessed === dataRelations.length) {
                    state.loaded = true;
                    try {
                        state.active = state.types[0].key;
                    } catch (err) {
                    }
                    this.setState(state);
                }
            }).catch(err => {
                console.log('load products', err);
                this.setState({error: true})
            });
        })
    }

    open(lines=[]) {
        let base_types = {
            'type_5': {name: 'app.wristband'},
            'type_7': {name: 'app.mini_wristband'},
            'coupon': {name: 'app.coupon'},
            'type_4': {name: 'app.gift_card'}
        };
        let filtered_types = {};
        let scans = {};
        lines.forEach(line => {
            if (base_types[line.product_type])
                filtered_types[line.product_type] = base_types[line.product_type];
            scans[line.uid] = {
                name: line.name, status: 'waiting', type: line.product_type, units: line.units,
                product_id: line.product_id, product_coupons: line.product_coupons, product_price: line.product_price}
        });
        this.setState({open: true, scans: scans, types: filtered_types});
    }

    close() {
        this.setState({open: false, types: {}, scans: {}, chips: {}});
    }

    scan_chip(uid, line_uid, type) {
        let scans = this.state.scans,
            line_data = scans[line_uid],
            chips = this.state.chips,
            chip = chips[uid];

        scans[line_uid].status = 'scanning';
        this.setState({scans: scans}, () => {
            let data = {
                "balance": line_data.product_price + (chip ? chip.balance : 0),
                "coupons": line_data.product_coupons + (chip ? chip.coupons : 0),
                "trips": 0,
                "type": type,
                "last_scan": moment().unix()
            };

            firestack.database.ref(`/chips/${uid}`).set(data).then((snapshot) => {
                scans[line_uid].status = 'scanned';
                chips[uid] = data;
                this.setState({scans: scans, chips: chips});
                // SystemLog(this.props.customer_uid, {
                //     balance: data.name,
                //     message: `Chip ${uid} has been scanned on the ticket ${ticket_uid}`,
                //     id: uid,
                //     key: 'chip',
                //     type: 'add'
                // });
            }).catch(err => {
                console.log(err);
            });
        });
    }

    clear_scanning() {
        let scans = this.state.scans;
        Object.keys(scans).forEach(key => {
           scans[key].status = 'waiting';
        });
        this.setState({scans: scans, chips: {}});
    }

    getItems() {
        let scans = this.state.scans ? Object.keys(this.state.scans).map(key => {
            let obj = this.state.scans[key];
            obj.label = `${this.props.intl.messages[this.state.types[obj.type].name]} (${this.props.intl.messages[`app.${obj.status}`]})`;
            return {...obj, key: key};
        }) : [];
        if (this.state.active !== '') {
            scans = scans.filter((obj) => {
                return obj.type === this.state.active;
            });
        }

        if (scans.length === 0) {
            return <Col><Text style={styles.textDark}>{this.props.intl.messages['app.noScans']}</Text></Col>
        }
        return (
            <FlatList
                data={scans}
                renderItem={({item}) =>
                    <TwoTextButtonItem text={item.label} intl={this.props.intl}
                                       // onPress={() => this.scan_chip('04001AFAE65385', item.key)}
                                       onPress={() => {
                                           if (this.state.scans[item.key].status !== 'scanned') {this.props.onPress(item.key)}
                                       }}
                                       style={[styles.modalButton, {
                                           backgroundColor: item.status === 'scanned' ? '#2dab61' : item.status === 'scanning' ? '#4285f4' : '#e84b3a',
                                           marginLeft: scale(5),
                                           marginRight: scale(5),
                                           height: scale(50)
                                       }]}
                                       detailsText={item.name}
                    />}
            />
        )
    }

    componentDidMount() {
        // init();
        DeviceEventEmitter.addListener('onStateChanged', function (e) {
            Alert.alert('State Changed ' + JSON.stringify(e))
        });

        DeviceEventEmitter.addListener('onRemoteTagDetected', (e) => {
            Alert.alert('Tag Detected ' + JSON.stringify(e))
        })
    }

    render() {
        let types = this.state.types ? Object.keys(this.state.types).map(key => {
            let obj = this.state.types[key];
            let scanned = Object.keys(this.state.scans).filter(scan_key => {
                let item = this.state.scans[scan_key];
                return item.type === key && item.status === 'scanned';
            }).length;
            let scanning = Object.keys(this.state.scans).filter(scan_key => {
                let item = this.state.scans[scan_key];
                return item.type === key && item.status === 'scanning';
            }).length;
            let item_count = Object.keys(this.state.scans).filter(scan_key => {
                let item = this.state.scans[scan_key];
                return item.type === key;
            }).length;
            obj.info = `${scanned} ${this.props.intl.messages['app.of']} ${item_count}`;
            if (scanned) {
                obj.color = '#2dab61';
                if (scanning)
                    obj.color = '#4285f4';
            } else
                obj.color = '#e84b3a';
            return {...obj, key: key};
        }) : [];
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: Dimensions.get('screen').height * 0.1,
                        left: Dimensions.get('screen').width * 0.1,
                        width: Dimensions.get('screen').width * 0.8,
                        height: Dimensions.get('screen').height * 0.8,
                        backgroundColor: '#e8eaeb',
                        paddingLeft: scale(40),
                        paddingRight: scale(40),
                        paddingTop: scale(0),
                        paddingBottom: scale(50)
                    }}>
                        <ModalCloseButton close={this.close}/>
                        <ModalHeader modalName={this.modalName} intl={this.props.intl}/>
                        <Row size={18}>
                            <Col size={40} style={{
                                borderRightWidth: 0.2,
                                borderColor: '#404048',
                                marginBottom: scale(20),
                                marginTop: scale(50)
                            }}>
                                <Row size={6.75}>
                                    {this.state.loaded ?
                                        <FlatList
                                            data={types}
                                            renderItem={({item}) =>
                                                <TwoTextButtonItem text={item.name} intl={this.props.intl}
                                                                   onPress={() => this.setActive(item.key)}
                                                                   style={[styles.modalButton, {
                                                                       backgroundColor: item.color,
                                                                       marginLeft: scale(5),
                                                                       marginRight: scale(5),
                                                                       height: scale(50)
                                                                   }]}
                                                                   textStyle={styles.modalButtonText}
                                                                   detailsText={item.info}
                                                />}
                                        /> :
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            flex: 1,
                                            alignItems: 'center'
                                        }}>
                                            <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(50)}
                                                             indeterminate={true}/>
                                        </View>
                                    }
                                </Row>
                                <Row size={0.25}/>
                                <Row size={0.4}>
                                    <ButtonItem text="app.clear_scanning" onPress={this.clear_scanning}
                                                intl={this.props.intl}
                                                style={[styles.modalButton, {
                                                    marginLeft: scale(5),
                                                    marginRight: scale(5),
                                                    height: scale(20),
                                                    backgroundColor: '#707076',
                                                }]}
                                                textStyle={styles.modalButtonText}/>
                                </Row>
                            </Col>
                            <Col size={65}
                                 style={{marginBottom: scale(20), marginTop: scale(50), paddingLeft: scale(20)}}>
                                <Row size={0.4}>
                                    {(this.state.loaded) &&
                                    <ButtonItem text={this.state.active_name} intl={this.props.intl}
                                                style={[styles.modalButton, {
                                                    backgroundColor: '#707076',
                                                    marginLeft: scale(5),
                                                    marginRight: scale(5),
                                                    height: scale(20)
                                                }]}
                                                textStyle={styles.modalButtonText}
                                    />}
                                </Row>
                                <Row size={7}>
                                    {(!this.state.loaded) ?
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            flex: 1,
                                            alignItems: 'center'
                                        }}>
                                            <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)}
                                                             indeterminate={true}/>
                                        </View> :
                                        this.getItems()
                                    }
                                </Row>
                            </Col>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}