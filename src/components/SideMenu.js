import React, {Component} from 'react';
import {
    Text, TouchableOpacity, Dimensions, Picker, AsyncStorage, Alert
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SwipeALot from 'react-native-swipe-a-lot';
import Modal from 'react-native-root-modal';
import {Actions} from 'react-native-router-flux';

import {IconButton, ButtonItem,} from './index';
import styles from '../style/styles';
import plainStyles from '../style/plain';
import {scale, scaleText} from '../scaling';


export default class SideMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.openModal = this.openModal.bind(this);
    }

    open() {
        console.log('TYPE', this.props.printerType);
        this.setState({open: true})
    }

    close() {
        this.setState({open: false})
    }

    openModal(name) {
        this.setState({open: false});
        this.props.openModal(name);
    }

    render() {
        let header = {
            height: scale(40),
            marginTop: 30, paddingRight: 10, paddingLeft: 10,
            alignSelf: 'stretch',
        };
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity onPress={this.close} style={[styles.modal, {
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    flex: 1,
                }]}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        backgroundColor: '#404048',
                        width: Dimensions.get('screen').width / 3,
                        top: 0,
                        bottom: 0
                    }}>
                        <Row size={1} style={header}>
                            <Col size={2}>
                                <Text style={{color: "white", marginTop: 5}}>Menu</Text>
                            </Col>
                            <Col size={10}/>
                            <Col size={1}>
                                <TouchableOpacity onPress={this.close}
                                                  style={[styles.timesIcon, {
                                                      marginTop: 0,
                                                      backgroundColor: '#53535a'
                                                  }]}>
                                    <Icon size={scaleText(18)} name="close" color="white"/>
                                </TouchableOpacity>
                            </Col>
                            <Col size={0.25}/>
                        </Row>
                        <Row size={6.75}>
                            <Col style={[styles.slide, {marginTop: 0}]}>
                                <Row>
                                    <IconButton price="app.terminal" icon="printer" intl={this.props.intl}
                                                onPress={() => {
                                                    if (this.props.permissions && this.props.permissions['function_15']) {
                                                        this.openModal('terminalStatus');
                                                    } else {
                                                        this.props.alert(this.props.intl.messages["app.missingPermissions"]);
                                                    }
                                                }}/>
                                    <IconButton price="app.closedReceipts" icon="close-circle-outline"
                                                intl={this.props.intl}
                                                onPress={() => {
                                                    this.close();
                                                    this.props.openClosedReceipts();
                                                }}/>
                                    <IconButton price="app.parkedReceipts" icon="pause" intl={this.props.intl}
                                                onPress={() => {
                                                    this.close();
                                                    this.props.openParkedReceipts();
                                                }}/>
                                </Row>
                                <Row>
                                    <IconButton price="app.openDay" icon="calendar-clock" intl={this.props.intl}
                                                onPress={() => this.openModal('openDay')}/>
                                    <IconButton price="app.closeDay" icon="calendar-remove" intl={this.props.intl}
                                                onPress={() => {
                                                    if (this.props.cash_shift_id === null)
                                                        this.props.alert(this.props.intl.messages["app.noShiftWarning"]);
                                                    else if (this.props.permissions && this.props.permissions['function_13']) {
                                                        this.openModal('closeDay');
                                                    } else {
                                                        this.props.alert(this.props.intl.messages["app.missingPermissions"]);
                                                    }
                                                }}/>
                                    <IconButton price="app.checkInOut" icon="check-circle-outline"
                                                intl={this.props.intl}
                                                onPress={() => {
                                                    if (this.props.permissions && this.props.permissions['function_7']) {
                                                        this.openModal('checkInOut');
                                                    } else {
                                                        this.props.alert(this.props.intl.messages["app.missingPermissions"]);
                                                    }
                                                }}/>
                                </Row>
                                <Row>
                                    <IconButton price="app.printer" icon="printer" intl={this.props.intl}
                                                onPress={() => {
                                                    if (this.props.permissions && this.props.permissions['function_25']) {
                                                        if (!!this.props.printerType && this.props.printerType !== 'mpop')
                                                            this.openModal('netprinterStatus');
                                                        else
                                                            this.openModal('printerStatus');
                                                    } else {
                                                        this.props.alert(this.props.intl.messages["app.missingPermissions"]);
                                                    }
                                                }}/>
                                    {/*<IconButton price="app.productionPrinter" icon="printer" intl={this.props.intl}*/}
                                                {/*onPress={() => this.openModal('netprinterStatus')}/>*/}
                                    <Col size={2}/>
                                </Row>
                                <Row size={3}/>
                            </Col>
                        </Row>
                        <Row size={0.75}>
                            <Col size={0.25}/>
                            <Col>
                                <Picker style={{color: '#fff'}}
                                        selectedValue={this.props.intl.locale}
                                        onValueChange={(itemValue, itemIndex) => {
                                            this.props.updateLang(itemValue);
                                            AsyncStorage.setItem('@PrimeDrive:last_lang', itemValue);
                                        }}>
                                    <Picker.Item label="English" value="en"/>
                                    <Picker.Item label="Danish" value="da"/>
                                </Picker>
                            </Col>
                            <Col size={0.25}/>
                        </Row>

                        <Row size={0.15}/>
                    </TouchableOpacity>
                </TouchableOpacity>

            </Modal>
        )
    }
}



