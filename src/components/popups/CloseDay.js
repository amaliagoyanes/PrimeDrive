import moment from 'moment';
import React, {Component} from 'react';
import {
    AsyncStorage,
    Dimensions,
    TouchableOpacity,
    Text, Switch,
    View, FlatList
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';

import {
    NumericKeyboard,
    ModalCloseButton,
    ActionConfirm,
    ModalHeader,
    ButtonItem,
    CashButton,
    toFixedLocale
} from '../index'
import {printReceipt, openCashDrawer, createCashBookEntry, createCashBookEntryFor} from '../../api/index';

import {fetchData, fetchReport, hexAverage} from '../../api';
import styles from '../../style/styles';
import firestack from '../../fbconfig.js'
import {scale, scaleText} from '../../scaling'
import * as Progress from 'react-native-progress';


export default class CloseDay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, input: '', error: false, cardTotal: 0, cashTotal: 0, euroTotal: 0, giftTotal: 0,
            paymentMethods: [], payments: {}, paymentsArr: [], paymentMethodsObj: {}, loaded: false,
            print: false, total: null, cashButtons: {}
        };
        this.modalName = 'app.closeDayUpper';
        this.buttons = [
            {text: '50 øre', unit: 0.5, key: 0}, {text: '1 kr.', unit: 1, key: 1}, {text: '2 kr.', unit: 2, key: 2},
            {text: '5 kr.', unit: 5, key: 3}, {text: '10 kr.', unit: 10, key: 4}, {text: '20 kr.', unit: 20, key: 5},
            {text: '50 kr.', unit: 50, key: 6}, {text: '100 kr.', unit: 100, key: 7},
            {text: '200 kr.', unit: 200, key: 8}, {text: '500 kr.', unit: 500, key: 9},
            {text: '1000 kr.', unit: 1000, key: 10},
        ];

        this.getPayments = this.getPayments.bind(this);
        this.getPaymentMethods = this.getPaymentMethods.bind(this);
        this.getZReport = this.getZReport.bind(this);
        this.close = this.close.bind(this);
        this.closeDay = this.closeDay.bind(this);
        this.forceCloseDay = this.forceCloseDay.bind(this);
        this.getCashTotal = this.getCashTotal.bind(this);
        this.getTotal = this.getTotal.bind(this);
        this.open = this.open.bind(this);
        this.numOnPress = this.numOnPress.bind(this);
        this.setActive = this.setActive.bind(this);
    }

    open() {
        this.setState({open: true}, () => {
            this.getPayments();
            if (!!this.props.printerType && this.props.printerType !== 'mpop')
                this.props.openDrawer();
            else
                openCashDrawer(null, (text) => this._alert.open(text));
        })
    }

    close() {
        this.setState({open: false, input: '', total: null, loaded: false})
    }

    setActive(key) {

    }

    forceCloseDay(callback = null) {
        this.getPayments(() => this.closeDay(callback));
    }

    getPaymentMethods() {
        fetchData('paymentMethods', {}).then(result => {
            let keys = Object.keys(result);
            // result.type_1 = {
            //     type: this.props.intl.messages['app.cash']
            // };
            // result.type_2 = {
            //     type: this.props.intl.messages['app.card']
            // };
            // keys.unshift("type_2");
            // keys.unshift("type_1");

            let color = '#404048';
            let mid = Math.floor(keys.length / 2);

            let data = keys.map((field, i) => {
                if (i > mid) {
                    color = '#8d8d91';
                }
                result[field].color = color;
                result[field].total = 0;
                return {...result[field], key: field}
            });
            if (data.length > 2) {
                let midColor = hexAverage('#8d8d91', data[0].color);
                data[mid].color = midColor;

                data.forEach((field, i) => {
                    if (i > 0 && i < keys.length - 1) {
                        if (i > mid)
                            color = hexAverage('#8d8d91', data[i - 1].color);
                        if (i < mid)
                            color = hexAverage(data[i - 1].color, midColor);
                        data[i].color = color;
                        result[data[i].key].color = color;
                    }
                });
            }
            this.setState({paymentMethods: data, paymentMethodsObj: result}, () => this.setState({loaded: true}));
        });
    }

    getPayments(callback = null) {
        this.getPaymentMethods();
        // AsyncStorage.getItem('@PrimeDrive:last_shift_uid').then(uid => {
        let uid = this.props.cash_shift_id;
        this.uid = uid;
        console.log(uid)
        firestack.database.ref(`/cashShifts/${uid}`).once('value').then((snapshot) => {
            this.shift = snapshot.val();
        });
        fetchData('payments', {cash_shift_id: uid}).then(result => {
            let payments = this.state.paymentMethodsObj;
            Object.keys(result).forEach(key => {
                if (result[key].cash_shift_id === uid) {
                    console.log(result[key])
                    if (result[key].payment_method !== '' && result[key].payment_method !== undefined) {
                        payments[result[key].payment_method].total += parseFloat(result[key].value);
                        // } else if (result[key].payment_type === 'type_1') {
                        //     payments.type_1.total += parseFloat(result[key].value);
                        // } else if (result[key].payment_type === 'type_2') {
                        //     payments.type_2.total += parseFloat(result[key].value);
                    }
                }
            });

            let keys = Object.keys(payments);
            // keys.splice(keys.indexOf('type_2'), 1);
            // keys.unshift('type_2');
            // keys.splice(keys.indexOf('type_1'), 1);
            // keys.unshift('type_1');

            let data = keys.map((field) => {
                return {...payments[field], key: field}
            });

            this.setState({paymentMethodsObj: payments, paymentMethods: data}, () => {
                if (!!callback)
                    callback();
            });
            // });
        }).catch(err => {
            console.log(err)
            this.setState({error: true})
        });
    }

    closeDay(callback = null) {
        if (!this.props.user_uid) {
            this._warning.open();
            return;
        }
        if (!this.props.loaded)
            return;

        let val = this.shift;
        if (!!val.start_time)
            val.start_time = moment();
        let startTime = moment(val.start_time * 1000);
        let endTime = moment();
        let settings = this.props.settings;
        let economic_token = settings ? settings.economic_token : '';
        let economic_appToken = settings ? settings.economic_appToken : '';
        val.close_user_id = this.props.user_uid || 'user_1';
        val.end_time = endTime.unix();
        val.close_cash_balance = this.getTotal();
        val.status = 'posted';
        let shiftInfo = {
            uid: this.uid,
            parked: this.shift.parked
        };
        if (economic_token && economic_appToken) {
            let economicCredentials = {
                token: economic_token,
                appToken: economic_appToken
            };
            this.state.paymentMethods.forEach(method => {
                if (method.total && method.total > 0) {
                    createCashBookEntry(
                        method.type, parseFloat(method.total),
                        economicCredentials, method.economic_account,
                        startTime.format('YYYY-MM-DDThh:mm:ss'),
                        endTime.format('YYYY-MM-DDThh:mm:ss'));
                }
            });
            createCashBookEntryFor('reports/tsc', this.props.customer_uid, economicCredentials, startTime, endTime);
        }
        AsyncStorage.removeItem('@PrimeDrive:last_shift_uid').then().catch(err => console.log(err));
        AsyncStorage.setItem('@PrimeDrive:last_closed_shift_uid', JSON.stringify(shiftInfo)).then().catch(err => console.log(err));
        this.props.updateCashShift('');

        if (this.state.print || !!this.props.settings.z_report) {
            firestack.database.ref(`/clientDepartments/${this.props.departmentId}`).once('value').then(snapshot => {
                let department = snapshot.val();
                let address = '', city = '', taxID = '', departmentName = '';
                if (department !== null) {
                    address = department.address || '';
                    city = department.city || '';
                    taxID = 'NR. ' + department.taxID || '';
                    departmentName = department.name || '';
                }
                console.log(departmentName, address, city, taxID);
                let receipt = {
                    total: this.getTotal(),
                    lines: [],
                    date: endTime.format('DD.MM.YYYY'),
                    time: endTime.format('HH:mm:ss'),
                    number: this.uid,
                    department: departmentName,
                    address: address,
                    city: city,
                    taxID: taxID
                };
                receipt.lines.push({name: "Open Balance", units: 1, product_price: parseFloat(val.open_cash_balance)});
                let hasPayment = false;
                this.state.paymentMethods.forEach(payment => {
                    if (parseInt(payment.total) !== 0) {
                        if (!hasPayment) {
                            hasPayment = true;
                            receipt.lines.push({name: "Closing Balance for Payments", units: 1, product_price: ''});
                        }
                        receipt.lines.push({name: payment.type, units: 1, product_price: parseFloat(payment.total)})
                    }
                });
                this.getZReport().then(reportData => {
                    receipt.products = reportData.tspReport;
                    receipt.payments = reportData.paymentsReport;
                    console.log(reportData.tspReport.length);
                    console.log(reportData.paymentsReport.length);
                    if (!!this.props.printerType && this.props.printerType !== 'mpop')
                        this.props.print(receipt, true);
                    else
                        printReceipt(receipt, true, undefined, undefined, (text) => this.props.alert(text));
                });
                if (this.props.settings.verifone_terminal) {
                    if (this.props.connected) {
                        try {
                            this.props.endOfDay();
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
            }).catch();
        }

        firestack.database.ref(`/cashShifts/${this.uid}`).set(val).then(response => {
            this.close();
            if (!!callback)
                callback();
        })
    }

    numOnPress(text) {
        let input = this.state.input + text;
        let cashButtons = this.state.cashButtons;
        cashButtons[this._current] = input;
        this.setState({input: input, cashButtons: cashButtons}, () => {
            if (this[this._current])
                this[this._current].setAmount(this.state.input);
        });
    }

    getCashTotal() {
        let total = 0.00;
        this.buttons.forEach((btn) => {
            if (this[`_cash${btn.key}`] !== undefined && this.state.cashButtons[`_cash${btn.key}`] !== undefined) {
                total += this.state.cashButtons[`_cash${btn.key}`] * btn.unit;
            }
        });
        return total
    }

    getTotal() {
        let total = 0.00;
        this.state.paymentMethods.forEach(method => {
            total += parseFloat(method.total);
        });
        return this.getCashTotal() + total;
    }

    getZReport() {
        return new Promise((resolve, reject) => {
            console.log('SHIFT UID', this.uid);
            fetchReport(this.uid).then(tsp => {
                fetchReport(this.uid, 'payments').then(payments => {
                    resolve({paymentsReport: payments, tspReport: tsp});
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    render() {
        let input = this.state.input;
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
                        {this.state.loaded ?
                            <Row size={18}>
                                <Col style={{
                                    marginTop: scale(30),
                                    paddingRight: scale(15),
                                    marginBottom: scale(20),
                                }}>
                                    <Row size={8}>
                                        <FlatList
                                            data={this.state.paymentMethods}
                                            renderItem={({item}) =>
                                                <ButtonItem text={item.type} intl={this.props.intl}
                                                            detailsText={toFixedLocale(item.total) + " DKK"}
                                                            onPress={() => {
                                                                this.setActive(item.key);
                                                            }}
                                                            style={[styles.modalButton, styles.buttonSidedText, {
                                                                height: scale(60),
                                                                backgroundColor: item.color,
                                                                marginRight: 0
                                                            }]}
                                                            textStyle={[styles.modalButtonText, {
                                                                textAlign: 'left', width: '50%'
                                                            }]}
                                                />}
                                        />
                                    </Row>
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
                                                        {this.props.intl !== undefined && this.props.intl.messages["app.balanceUpper"]}
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
                                                        {toFixedLocale(this.getTotal())} DKK
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
                                    <Row>
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
                                                                    this.setState({input: amount});
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
                                    <NumericKeyboard size={78} numOnPress={this.numOnPress} intl={this.props.intl}
                                                     input={input}
                                                     cleanInput={() => {
                                                         let input = this.state.input.slice(0, this.state.input.length - 1);
                                                         let cashButtons = this.state.cashButtons;
                                                         cashButtons[this._current] = input;
                                                         this.setState({
                                                                 input: input.slice(0, input.length - 1),
                                                                 cashButtons: cashButtons
                                                             },
                                                             () => this[this._current].setAmount(this.state.input));
                                                     }}
                                                     showDelimiter/>
                                    <Row size={8}>
                                        <Col style={{alignItems: 'flex-end', justifyContent: 'center'}} size={3}>
                                            <Text>{this.props.intl !== undefined && this.props.intl.messages["app.closeAmount"]}</Text>
                                        </Col>
                                        <Col style={{alignItems: 'flex-end', justifyContent: 'center'}} size={1}>
                                            <Switch value={this.state.print} onTintColor='#3cb671'
                                                    onValueChange={(val) => this.setState({print: val})}/>
                                        </Col>
                                    </Row>
                                    <Row size={14}>
                                        <ButtonItem text={this.modalName} onPress={this.closeDay} intl={this.props.intl}
                                                    active={this.props.loaded}
                                                    style={[styles.modalButton, {
                                                        backgroundColor: '#3cb671',
                                                        marginRight: 0
                                                    }]}
                                                    textStyle={styles.modalButtonText}/>
                                    </Row>
                                </Col>
                            </Row>
                            :
                            <Row size={18}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flex: 1,
                                    alignItems: 'center'
                                }}>
                                    <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)}
                                                     indeterminate={true}/>
                                </View>
                            </Row>
                        }
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
