import moment from 'moment';
import React, {Component} from 'react';
import {
    AsyncStorage,
    Dimensions,
    TouchableOpacity,
    Text, Switch,
    View, FlatList, Alert
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';

import {
    NumericKeyboard,
    ActionConfirm,
    ModalCloseButton,
    ModalHeader,
    ButtonItem,
    toFixedLocale,
    CashButton,
    guid
} from '../index';
import {printReceipt, openCashDrawer} from '../../api/index';
import styles from '../../style/styles';
import firestack from '../../fbconfig.js';
import {scale, scaleText} from '../../scaling';


export default class OpenDay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, input: '', print: false, total: null, cashButtons: {}
        };
        this.modalName = 'app.openDayUpper';
        this.buttons = [
            {text: '50 øre', unit: 0.5, key: 0}, {text: '1 kr.', unit: 1, key: 1}, {text: '2 kr.', unit: 2, key: 2},
            {text: '5 kr.', unit: 5, key: 3}, {text: '10 kr.', unit: 10, key: 4}, {text: '20 kr.', unit: 20, key: 5},
            {text: '50 kr.', unit: 50, key: 6}, {text: '100 kr.', unit: 100, key: 7},
            {text: '200 kr.', unit: 200, key: 8}, {text: '500 kr.', unit: 500, key: 9},
            {text: '1000 kr.', unit: 1000, key: 10},
        ];

        this.close = this.close.bind(this);
        this.cleanInput = this.cleanInput.bind(this);
        this.getTotal = this.getTotal.bind(this);
        this.open = this.open.bind(this);
        this.openDay = this.openDay.bind(this);
        this.numOnPress = this.numOnPress.bind(this);
    }

    open() {
        this.setState({open: true}, () => {
            if (!!this.props.printerType && this.props.printerType !== 'mpop')
                this.props.openDrawer();
            else
                openCashDrawer(null, (text) => this._alert.open(text));
        })
    }

    close() {
        this.setState({open: false, input: '', total: null, cashButtons: {}})
    }

    openDay(total) {
        let startTime = moment();
        if (!this.props.user_uid) {
            this._warning.open();
            return;
        }

        let shift = {
            client_id: this.props.client_id || 'client_1',
            open_user_id: this.props.user_uid,
            customer_uid: this.props.customer_uid,
            dealer_uid: this.props.dealer_uid,
            start_time: startTime.unix(),
            last_ticket_number: 0,
            status: 'open',
            open_cash_balance: total === null ? this.getTotal() : parseFloat(total)
        };
        let shift_uid = guid();
        console.log('new shift', shift_uid);
        if (this.state.print || !!this.props.settings.z_report) {
            console.log('CALLED PRINT');
            firestack.database.ref(`/clientDepartments/${this.props.departmentId}`).once('value').then(snapshot => {
                let department = snapshot.val();
                let address = '', city = '', taxID = '', departmentName = '';
                if (department !== null) {
                    address = department.address || '';
                    city = department.city || '';
                    taxID = 'NR. ' + department.taxID || '';
                    departmentName = department.name || '';
                }
                let receipt = {
                    total: total === null ? this.getTotal() : parseFloat(total),
                    lines: [],
                    date: startTime.format('DD.MM.YYYY'),
                    time: startTime.format('HH:mm:ss'),
                    number: shift_uid,
                    department: departmentName,
                    address: address,
                    city: city,
                    taxID: taxID
                };
                if (!!this.props.printerType && this.props.printerType !== 'mpop')
                    this.props.print(receipt, true);
                else
                    printReceipt(receipt, true, undefined, undefined, (text) => this.props.alert(text));
            }).catch();
        }

        this.props.updateCashShift(shift_uid);
        this.close();

        AsyncStorage.getItem('@PrimeDrive:last_shift_uid').then(uid => {
            let shiftInfo = {
                uid: uid,
            };
            firestack.database.ref(`/cashShifts/${uid}`).once('value').then((snapshot) => {
                let shift = snapshot.val();
                if (!!shift)
                    shiftInfo.parked = shift.parked;
            });
            AsyncStorage.setItem('@PrimeDrive:last_closed_shift_uid', JSON.stringify(shiftInfo)).then().catch(err => console.log(err));

            AsyncStorage.setItem('@PrimeDrive:last_shift_uid', shift_uid).then().catch();
            AsyncStorage.setItem('@PrimeDrive:last_ticket_number', '0').then().catch();
        });

        AsyncStorage.getItem('@PrimeDrive:last_closed_shift_uid').then(val => {
            if (!!val) {
                val = JSON.parse(val);
                shift.parked = val.parked;
            }
            firestack.database.ref(`/cashShifts/${shift_uid}`).set(shift).then().catch(err => {
                AsyncStorage.removeItem('@PrimeDrive:last_shift_uid').then(() => {
                    this.props.updateCashShift(null);
                });
            });
        }).catch(err => console.log(err));
    }

    numOnPress(text) {
        let input = this.state.input + text;
        let cashButtons = this.state.cashButtons;
        cashButtons[this._current] = input;
        if (this.state.total === null) {
            this.setState({input: input, cashButtons: cashButtons}, () => {
                this[this._current].setAmount(this.state.input)
            });
        } else {
            this.setState({input: input, total: input})
        }
    }

    cleanInput(){
        let input = this.state.input.slice(0, this.state.input.length - 1);
        let cashButtons = this.state.cashButtons;
        cashButtons[this._current] = input;
        if (this.state.total === null) {
            this.setState({input: input, cashButtons: cashButtons}, () => {
                this[this._current].setAmount(this.state.input)
            })
        } else {
            this.setState({input: input, total: input.length > 0 ? input : 0})
        }
    }

    getTotal() {
        let total = 0.00;
        this.buttons.forEach(btn => {
            if (this[`_cash${btn.key}`] !== undefined && this.state.cashButtons[`_cash${btn.key}`] !== undefined) {
                total += this.state.cashButtons[`_cash${btn.key}`] * btn.unit;
            }
        });
        return total
    }

    render() {
        let input = this.state.input;
        let total = this.state.total !== null ? this.state.total : this.getTotal();
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
                        paddingBottom: scale(20)
                    }}>
                        <ModalCloseButton close={this.close}/>
                        <ModalHeader modalName={this.modalName} intl={this.props.intl}/>
                        <Row size={18}>
                            <Col style={{
                                marginTop: scale(30),
                                paddingRight: scale(15),
                                marginBottom: scale(20),
                            }}>
                                <Row>
                                    <ButtonItem text="app.cash" detailsText={toFixedLocale(total) + " DKK"}
                                                onPress={() => {
                                                    if (this.state.total === null) {
                                                        this.setState({total: total, input: total === 0 ? '' : total.toString()});
                                                        this.buttons.forEach((btn, i) => {
                                                            let ref = `_cash${i}`;
                                                            this[ref].deactivate();
                                                        });
                                                    }
                                                }} modalActive intl={this.props.intl}
                                                style={[styles.modalButton, styles.buttonSidedText, {
                                                    backgroundColor: '#404048', marginRight: 0
                                                }]}
                                                textStyle={[styles.modalButtonText, {
                                                    textAlign: 'left', width: '50%'
                                                }]}/>
                                </Row>
                                <Row size={6}/>
                                <Row>
                                    <Col style={{borderBottomWidth: 0.3, borderColor: '#727278'}}>
                                        <Row>
                                            <Col>
                                                <Text
                                                    style={[styles.text, {
                                                        fontSize: scaleText(16),
                                                        textAlign: 'right',
                                                        color: '#313138'
                                                    }]}>
                                                    {this.props.intl !== undefined && this.props.intl.messages["app.totalUpper"]}
                                                </Text>
                                            </Col>
                                        </Row>
                                        <Row
                                            style={{
                                                borderBottomWidth: 1,
                                                borderColor: '#727278',
                                                marginBottom: scale(5)
                                            }}>
                                            <Col>
                                                <Text
                                                    style={[styles.text, {
                                                        fontSize: scaleText(18),
                                                        fontFamily: 'Gotham-Bold',
                                                        textAlign: 'right',
                                                        color: '#313138'
                                                    }]}>
                                                    {toFixedLocale(total)} DKK
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                            <Col style={{
                                marginBottom: scale(20),
                                marginTop: scale(30),
                                paddingRight: scale(15),
                                paddingLeft: scale(15),
                            }}>
                                <Row size={1}>
                                    <ButtonItem text="app.cash" disabled intl={this.props.intl}
                                                style={[styles.modalButton, styles.openDayButton, styles.buttonSidedText]}
                                                textStyle={[styles.modalButtonText, {fontSize: scaleText(18)}]}/>
                                </Row>
                                <Row size={7}>
                                    <FlatList
                                        data={this.buttons}
                                        renderItem={({item}) =>
                                                <CashButton text={item.text} units={item.units}
                                                            ref={elt => this[`_cash${item.key}`] = elt}
                                                            refId={`_cash${item.key}`}
                                                            activate={(refId, amount) => this.buttons.forEach((btn, i) => {
                                                                let ref = `_cash${i}`;
                                                                if (refId !== ref && this[ref]) {
                                                                    this[ref].deactivate();
                                                                } else if (this[ref]) {
                                                                    this.setState({input: amount, total: null});
                                                                    this._current = ref;
                                                                    this[ref].activate();
                                                                }
                                                            })}/>
                                        }/>
                                </Row>
                            </Col>
                            <Col style={{
                                marginTop: scale(30),
                                paddingLeft: scale(15),
                                marginBottom: scale(20),
                            }}>
                                <NumericKeyboard size={78} numOnPress={this.numOnPress} input={input}
                                                 disabled={this._current === undefined || this.total === null} intl={this.props.intl}
                                                 cleanInput={this.cleanInput}
                                                 showDelimiter/>
                                <Row size={8}>
                                    <Col style={{alignItems: 'flex-end', justifyContent: 'center'}} size={3}>
                                        <Text style={{fontSize: scaleText(12)}}>{this.props.intl !== undefined && this.props.intl.messages["app.openAmount"]}</Text>
                                    </Col>
                                    <Col style={{alignItems: 'flex-end', justifyContent: 'center'}} size={1}>
                                        <Switch value={this.state.print} onTintColor='#3cb671'
                                                onValueChange={(val) => this.setState({print: val}) }/>
                                    </Col>
                                </Row>
                                <Row size={14}>
                                    <ButtonItem text="app.openDay" onPress={() => this.openDay(total)} intl={this.props.intl}
                                                style={[styles.modalButton, {
                                                    backgroundColor: '#3cb671',
                                                    marginRight: 0
                                                }]}
                                                textStyle={styles.modalButtonText}/>
                                </Row>
                            </Col>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
                <ActionConfirm ref={elt => this._printing = elt} noButtons intl={this.props.intl}>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.printing"]}</Text></Row>
                </ActionConfirm>
                <ActionConfirm ref={elt => this._warning = elt} intl={this.props.intl} onOk={this.props.openUserLogin}>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.notLoggedIn"]}</Text></Row>
                </ActionConfirm>

            </Modal>
        )
    }
}

