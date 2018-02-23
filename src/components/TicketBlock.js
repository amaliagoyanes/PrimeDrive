import axios from 'axios';
import moment from 'moment';
import React, {Component} from 'react';
import {
    ListView, AsyncStorage, Alert,
    TouchableOpacity, Text, View,
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Col, Row} from 'react-native-easy-grid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SwipeALot from 'react-native-swipe-a-lot';
import {Actions} from 'react-native-router-flux';
import * as Terminal from 'react-native-verifone';

import {
    TicketLine, ActionConfirm, IconButton, ButtonItem, ButtonMeasures, AlertPopup,
    SectionHeader, Payment, ListViewRow, NumberPopup, ReceiptTotals, TablePicker, Scanner, ChipCreator, SplitPayment
} from './index';
import {getPrinterStatus, openCashDrawer, printReceipt, fetchReceipts} from '../api';
import firestack from '../fbconfig.js'
import styles from '../style/styles';
import plainStyles from '../style/plain';
import {updateUserUID} from '../reducers/actions';
import {scale, scaleText} from '../scaling';
import {toFixedLocale, toFixedLocaleDa} from './plain/receipts/plainComponents';


export default class TicketBlock extends Component {
    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
        this.state = {
            active: null, px: 100, py: 100, parked: undefined, closeInProgress: false,
            dataSource: ds.cloneWithRows(props.dataSource),
            selectedTable: null, discount: props.ticketData.discount || 0,
            returnMode: false
        };

        let CancelToken = axios.CancelToken;
        this.source = CancelToken.source();
        this.closeFinished = this.closeFinished.bind(this);
        this.getTotal = this.getTotal.bind(this);
        this.getTotalWithDiscount = this.getTotalWithDiscount.bind(this);
        this.resetButtons = this.resetButtons.bind(this);
        this.setActive = this.setActive.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.onFuncPress = this.onFuncPress.bind(this);
        this.onFuncLongPress = this.onFuncLongPress.bind(this);
        this.printReceipt = this.printReceipt.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.setTicketDiscount = this.setTicketDiscount.bind(this);
        this.updateSelectedTable = this.updateSelectedTable.bind(this);
        this.returnMode = this.returnMode.bind(this);
        this.abort = this.abort.bind(this);
        this.updateListener = this.updateListener.bind(this);
        this.updateDataList = this.updateDataList.bind(this);
    }

    setActive(data) {
        this.props.setActive(data);
    }

    logoutUser() {
        this.props.dispatch(updateUserUID(''));
        AsyncStorage.removeItem('@PrimeDrive:user_info');
        AsyncStorage.removeItem('@PrimeDrive:user_uid');
        this.props.openUserLogin();
    }

    returnMode(state) {
        let mode = state !== undefined ? state : !this.state.returnMode;
        // if (mode) {
        //     this._returnInfo.open();
        //     setTimeout(() => this._returnInfo.close(), 1500)
        // }

        this.setState({
            returnMode: mode
        })
    }

    updateDataList(dataSource, scroll) {
        let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
        if (dataSource === undefined)
            this.setState({
                dataSource: ds.cloneWithRows(this.props.dataSource),
                selectedTable: this.props.selectedTable
            }, () => {
                if (!!this._listView && scroll)
                    setTimeout(() => this._listView.scrollToEnd({animated: true}));
                    // setTimeout(() => this._listView.scrollToEnd({animated: true}), 200);
            });
        else
            this.setState({dataSource: ds.cloneWithRows(dataSource), selectedTable: this.props.selectedTable, discount: 0}, () => {
                if (!!this._listView && scroll)
                    setTimeout(() => this._listView.scrollToEnd({animated: true}));
                    // setTimeout(() => this._listView.scrollToEnd({animated: true}), 200);
            })
    }

    updateSelectedTable(selectedTable) {
        this.setState({selectedTable: selectedTable});
        this._tablePicker.close();
    }

    setTicketDiscount(amount, uid, product_uid,) {
        this.setState({discount: amount}, () => this.props.saveTicketDiscount(amount));
    }

    handleValueChange(snapshot) {
        let val = snapshot.val();
        if (val && this.state.parked !== val.parked) {
            // console.log('UPDATED ', val.parked);
            this.setState({parked: val.parked});
        }
    }

    componentDidMount() {
        if (this.props.cash_shift_id !== undefined)
            setTimeout(() => { //delaying until loading is completely finished
                firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).on('value', this.handleValueChange);
            }, 1500);
    }

    updateListener(count){
        if (count !== this.state.parked || count === undefined) {
            try {
                firestack.database.ref(`/layouts/${this.props.cash_shift_id}/`).off('value');
            } catch (err) {
            }
            // console.log('ADDING LISTENER');
            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).on('value', this.handleValueChange);
        }
    }

    componentDidUpdate(props, state) {
        if (this.props.cash_shift_id !== undefined &&
            (props.cash_shift_id !== this.props.cash_shift_id)) {
            if (props.cash_shift_id && props.cash_shift_id !== this.props.cash_shift_id)
                firestack.database.ref(`/layouts/${props.cash_shift_id}/`).off('value');
            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).on('value', this.handleValueChange);
        }
    }

    componentWillUnmount() {
        firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).off('value');
    }

    getTotal(data) {
        let total = 0;
        let dataSource = (data === undefined) ? this.props.dataSource : data;
        dataSource.forEach(i => {
            if (i.product_price) {
                let splitted = (i.splitUnits>0) ? i.splitRatio : 1;
                let price = i.product_price * i.units * splitted;
                if (i.campaign && i.campaign.amount && i.campaign.type === 'discount')
                    price = price * (1 - parseFloat(i.campaign.amount.replace(',', '.')) / 100);
                if (i.campaign && i.campaign.amount && i.campaign.type === 'price')
                    price = parseFloat(i.campaign.amount.replace(',', '.')) * i.units * splitted;
                if (i.discount)
                    price = price * (1 - parseFloat(i.discount.replace(',', '.')) / 100);
                total += price
            }
        });
        return total.toFixed(2);
    }

    getTotalWithDiscount(data, discount) {
        let total = this.getTotal(data);
        discount = discount || this.state.discount;
        if (discount !== 0 && discount !== undefined) {
            total = total * (1 - discount / 100);
        }
        return total;
    }

    async abort() {
        try {
            const result = await Terminal.abort();
            this.props.abort();
        } catch (err) {
            console.log("ABORT ERR", err);
        }
    }

    printReceipt(proforma = true, silent = true) {
        this.setState({printing: true});
        if (this.props.dataSource.length) {
            firestack.database.ref(`/clientDepartments/${this.props.departmentId}`).once('value').then(snapshot => {
                let department = snapshot.val();
                let address = '', city = '', taxID = '', departmentName = '';
                if (department !== null) {
                    address = department.address || '';
                    city = department.city || '';
                    taxID = 'NR. ' + department.taxID || '';
                    departmentName = department.name || '';
                }
                console.log('TOTAL TO PRINT', parseFloat(this.getTotal()).toFixed(2));

                let receipt = {
                    total: parseFloat(this.getTotal()).toFixed(2),
                    lines: this.props.dataSource,
                    date: moment.unix(this.props.timestamp).format('DD.MM.YYYY'),
                    time: moment.unix(this.props.timestamp).format('HH:mm:ss'),
                    number: !!this.props.number ? this.props.number : '',
                    table: this.props.table,
                    proforma: proforma,
                    department: departmentName,
                    address: address,
                    city: city,
                    taxID: taxID,
                    language: this.props.intl.locale
                };
                if (!!this.state.discount) {
                    let discVal = parseFloat(this.getTotal()).toFixed(2) * this.state.discount / 100;
                    receipt.discount = {name: `${this.state.discount}%`, value: toFixedLocaleDa(discVal)};
                }
                console.log(receipt.discount);
                if (!!this.props.printerType && this.props.printerType !== 'mpop') {
                    this.props.print(receipt, false, () => this.setState({printing: false}));
                } else
                    printReceipt(receipt, false, this.props.port, () => {
                        this.setState({printing: false});
                    }, (text) => this._alert.open(text));
            }).catch(err => {
                console.log('GET RECEIPTS');
                this.setState({printing: false});
            });
        } else {
            if (!silent)
                this._retrieving.open();
            console.log('started retrieving for print');
            fetchReceipts('tickets', {object_uid: this.props.cash_shift_id, status: 'closed'}, this.source.token).then(data => {
                let receipts = data, receipt = {};
                if (receipts.length === 0) {
                    this._retrieving.close();
                    this._noReceipts.open();
                    setTimeout(() => this._noReceipts.close(), 1500);
                    return
                }
                console.log('getting department info for print');
                firestack.database.ref(`/clientDepartments/${this.props.departmentId}`).once('value').then(snapshot => {
                    let department = snapshot.val();
                    let address = '', city = '', taxID = '', departmentName = '';
                    if (department !== null) {
                        address = department.address || '';
                        city = department.city || '';
                        taxID = 'NR. ' + department.taxID || '';
                        departmentName = department.name || '';
                    }

                    if (receipts.length !== 0) {
                        receipt = {
                            total: receipts[0].total,
                            lines: [],
                            date: moment.unix(receipts[0].timestamp).format('DD.MM.YYYY'),
                            time: moment.unix(receipts[0].timestamp).format('HH:mm:ss'),
                            number: receipts[0].number,
                            table: receipts[0].table,
                            department: departmentName,
                            address: address,
                            city: city,
                            taxID: taxID,
                            language: this.props.intl.locale
                        };

                        if (department !== null && department !== undefined && department.images) {
                            try {
                                receipt.logo = department.images[Object.keys(department.images)[0]].downloadURL;
                            } catch (err) {
                            }
                        }

                        if (receipts[0].discount)
                            receipt.discount = {
                                name: `-${receipts[0].discount}%`,
                                value: `-${receipts[0].discount / 100 * receipts[0].total}`
                            };
                        let lines = receipts[0].ticket_lines;
                        if (lines)
                            lines = Object.keys(lines).map(key => {
                                return {...lines[key], uid: key}
                            });
                        let payments = receipts[0].payments;
                        if (payments)
                            payments = Object.keys(payments).map(key => {
                                let type = payments[key].payment_type !== undefined ? payments[key].type : this.props.intl.messages[`app.${payments[key].type.toLowerCase()}`];
                                if (!!type)
                                    type = type.toUpperCase();
                                else
                                    type = payments[key].type;
                                return {...payments[key], uid: key, type: type};
                            });
                        receipt.lines = lines;
                        receipt.payments = payments;
                        if (!silent)
                            this._retrieving.close();
                        if (!!this.props.printerType && this.props.printerType !== 'mpop') {
                            this.props.print(receipt, false, () => this.setState({printing: false}));
                        } else
                            printReceipt(receipt, false, this.props.port, () => {
                                this.setState({printing: false});
                            }, (text) => this._alert.open(text));
                    } else {
                        if (!silent)
                            this._retrieving.close();
                        this._noReceipts.open();
                        this.setState({printing: false});
                        setTimeout(() => this._noReceipts.close(), 1500);
                    }
                });
            }).catch(err => {
                console.log('GET RECEIPTS');
                this.setState({printing: false});
            });
        }
    }

    resetButtons() {
        this._buttons.swipeToPage(0);
    }

    closeFinished() {
        this.setState({closeInProgress: false})
    }

    onFuncLongPress(key, uid, px, py) {
        switch (key) {
            case 'function_18':
                if (this.props.permissions && this.props.permissions['function_18']) {
                    this._splitReceipt.open(px,py);
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            default:
                return
        }
    }

    onFuncPress(key, uid, px, py) {
        switch (key) {
            case 'function_1':
                if (this.props.permissions && this.props.permissions['function_1']) {
                    getPrinterStatus().then(status => this._alert.open(status))
                        .catch(err => this._alert.open(`Status: ${err}`));
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_2':
                if (this.props.permissions && this.props.permissions['function_2']) {
                    this.printReceipt();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_3':
                if (this.props.permissions && this.props.permissions['function_3']) {
                    if (!!this.props.printerType && this.props.printerType !== 'mpop')
                        this.props.openDrawer();
                    else
                        openCashDrawer(null, (text) => this._alert.open(text));
                        // openCashDrawer(this.props.port, (text) => this._alert.open(text));
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_4':
                if (this.props.permissions && this.props.permissions['function_4']) {
                    this.props.toggleReturnMode();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_5':
                if (this.props.permissions && this.props.permissions['function_5']) {
                    this.props.clearDataSource();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_6':
                if (this.props.permissions && this.props.permissions['function_6']) {
                    // this.state.dataSource.getRowCount() > 0 ? this._confirmPark.open() : Alert.alert(this.props.intl.messages["app.statusInfo"], this.props.intl.messages["app.emptyReceipt"]);
                    this.state.dataSource.getRowCount() > 0 ? this.props.parkTicket() : this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_7':
                if (this.props.permissions && this.props.permissions['function_7']) {
                    this.props.openModal('checkInOut');
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_8':
                if (this.props.permissions && this.props.permissions['function_8']) {
                    this.state.dataSource.getRowCount() > 0 ? this._payment.open() : this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_9':
                if (this.props.permissions && this.props.permissions['function_9']) {
                    if (this.state.dataSource.getRowCount() > 0) {
                        let param = this.props.functions[uid].parameter;
                        if (param === 'type_1') {
                            this.payment_type = 'cash';
                        } else if (param === 'type_2') {
                            this.payment_type = 'card';
                        }
                        this._numberPad.open(px, py);
                    } else
                        this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_13':
                if (this.props.permissions && this.props.permissions['function_13']) {
                    this.props.openModal('closeDay');
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_14':
                if (this.props.permissions && this.props.permissions['function_14']) {
                    Actions.createCustomerScreen();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_18':
                if (this.props.permissions && this.props.permissions['function_18']) {
                    this._splitPayment.open();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_19':
                if (this.props.permissions && this.props.permissions['function_19']) {
                    // Actions.tableManagement();
                    this.state.dataSource.getRowCount() > 0 ? this._tablePicker.open() : this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_20':
                if (this.props.permissions && this.props.permissions['function_20']) {
                    this.logoutUser();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_22':
                if (this.props.permissions && this.props.permissions['function_22']) {
                    this.state.dataSource.getRowCount() > 0 ? this._discountPad.open(px, py) : this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_23':
                if (this.props.permissions && this.props.permissions['function_23']) {
                    this.props.openClosedReceipts();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            case 'function_24':
                if (this.props.permissions && this.props.permissions['function_24']) {
                    this.props.openParkedReceipts();
                } else {
                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                }
                break;
            default:
                return
        }
    }

    render() {
        let total = this.getTotal();
        let functions = this.props.functions ? Object.keys(this.props.functions).map(func => {
            return {...this.props.functions[func], uid: func}
        }) : [];
        functions.sort(function (first, second) {
            return first['order'] - second['order'];
        });
        let userData = this.props.userData || {};
        let name = userData.name ? userData.name.toUpperCase() : 'Jens Hansen';
        let functionParams = {
            'function_1': {icon: 'cloud-print',}, // send to printer
            'function_2': {icon: 'printer',}, // print receipt
            'function_3': {icon: 'open-in-new',}, // open cash drawer
            'function_4': {icon: 'backup-restore', 'status': this.props.returnMode}, // return receipt
            'function_5': {icon: 'plus',}, // new receipt
            'function_6': {icon: 'pause', badge: this.state.parked > 0 ? this.state.parked : undefined,}, //park receipt
            'function_7': {icon: 'check-circle-outline',}, // check in/out
            'function_8': {icon: 'window-maximize'}, // payment window
            'function_9': {icon: 'security', measures: {}}, // payment key
            'function_10': {icon: 'poll-box', measures: {}}, // warehouse management
            'function_11': {icon: 'chart-line'}, // statistics
            'function_12': {icon: 'cash-multiple'}, // deposits
            'function_13': {icon: 'calendar-remove',}, // close day
            'function_14': {icon: 'account-plus',}, // create customer
            'function_15': {icon: 'printer',}, // payment terminal
            'function_16': {icon: 'web'}, // url webite
            'function_17': {icon: 'keyboard', measures: {}}, // numeric keyboard
            'function_18': {icon: 'call-split',  measures: {}}, // split payment
            'function_19': {icon: 'food-fork-drink',}, // table management
            'function_20': {icon: 'power',}, // user logout
            'function_21': {icon: 'keyboard', measures: {},}, // on-screen keyboard
            'function_22': {icon: 'percent', measures: {},}, // discount
            'function_23': {icon: 'close-circle-outline',}, // closed receipts
            'function_24': {icon: 'pause-circle-outline',}, // parked receipts
        };
        let max = 4;
        let defaultGrid = [{w: 1, name: 'button_1'}, {w: 2, name: 'button_2'}, {w: 1, name: 'button_3'}];
        let paymentButtons = this.props.paymentButtons ? JSON.parse(this.props.paymentButtons) : {};
        if (Object.keys(paymentButtons).length === 0) {
            max = 3;
            paymentButtons = defaultGrid;
        }
        let options = {};
        let getGridNumber = Object.keys(paymentButtons).forEach((item, i) => {
            if (paymentButtons[item].w > 1) {
                Array.apply(null, {length: paymentButtons[item].w-1}).map((d, i) => {
                    i++, options[(Number(item)+i)] = true;
                });
            }
        });

        return (
            <View style={[styles.slide, {marginBottom: 0}]}>
                <Row size={5} style={{marginBottom: 8}}>
                    <Col style={styles.baseSideMenuRow}>
                        <View style={styles.timesIconRow}>
                            <TouchableOpacity onPress={() => {
                                if (this.props.permissions && this.props.permissions['function_23']) {
                                    this._confirm.open()
                                } else {
                                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                }
                            }} style={styles.timesIcon}>
                                <Icon size={scaleText(18)} name="close" color="white"/>
                            </TouchableOpacity>
                        </View>
                        {!this.state.printing && !this.props.transaction && !this.props.paying &&
                        <View style={styles.progressRow}/>
                        }
                        {this.state.printing &&
                        <View style={styles.progressRow}>
                            <FlickeringIcon style={styles.icon} name="printer" size={scaleText(20)} color="white"/>
                        </View>
                        }
                        {this.props.transaction &&
                        <View style={styles.progressRow}>
                            <TouchableOpacity onPress={this.abort} style={styles.timesIcon}>
                                <FlickeringIcon style={styles.icon} name="credit-card-multiple" size={scaleText(20)}
                                                color="white"/>
                            </TouchableOpacity>
                        </View>
                        }
                        {this.props.paying && !this.props.transaction && this.state.closeInProgress &&
                        <View style={styles.progressRow}>
                                <FlickeringIcon style={styles.icon} name="cash" size={scaleText(20)}
                                                color="white"/>
                        </View>
                        }
                        {/*<Row size={1} style={{alignSelf: 'stretch', paddingLeft: 15}}>*/}
                            {/*<Text style={styles.text}>CUSTOMER</Text>*/}
                        {/*</Row>*/}
                        {this.props.table !== '' && this.props.table !== undefined && this.props.number !== 0 &&
                        <Row style={{
                            alignSelf: 'stretch', alignItems: 'center',
                            paddingLeft: 15, paddingRight: 25,
                        }}><TouchableOpacity onPress={() => {
                                if (this.props.permissions && this.props.permissions['function_19']) {
                                    this.props.updateNumber();
                                } else {
                                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                }
                            }}>
                            <Text style={[styles.text]}>
                                {this.props.intl.messages["app.ticketTable"]}: {''+this.props.table}
                            </Text>
                        </TouchableOpacity></Row>
                        }
                        {this.props.dataSource.length > 0 || (this.props.number !== undefined && this.props.number !== 0) ?
                            <Row size={3} style={{
                                alignSelf: 'stretch', alignItems: 'center',
                                paddingLeft: 15, paddingRight: 25,
                            }}>
                                <ButtonItem text="app.setTicketTable" intl={this.props.intl}
                                            onPress={() => {
                                                if (this.props.permissions && this.props.permissions['function_19']) {
                                                    this.props.updateNumber();
                                                } else {
                                                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                                }
                                            }}
                                            style={[styles.innerButton, {
                                                marginBottom: scale(10)
                                            }]}/>
                            </Row> : <Row size={3}/>
                        }
                        <Row size={20} style={{
                                 paddingTop: scale(10)
                             }}>
                            {this.props.dataSource.length > 0 ?
                                <Col>
                                    <Row size={2}>
                                        <SectionHeader intl={this.props.intl}/>
                                    </Row>
                                    <Row size={15}><Col>
                                    <ListView ref={elt => this._listView = elt}
                                              dataSource={this.state.dataSource} enableEmptySections={true}
                                              renderRow={(data) =>
                                                  <ListViewRow {...data}
                                                               onDelete={this.props.deleteItem} intl={this.props.intl}
                                                               onPress={(px, py) => {
                                                                   this._ticketLine.open(
                                                                       px, py, data.units, data.name, data.uid, data.note,
                                                                       data.product_price, data.discount || '', data.campaign || '')
                                                               }}/>}
                                    />
                                    </Col></Row>
                                    <Row size={3}>
                                        <ReceiptTotals total={this.getTotal()}
                                                       intl={this.props.intl}
                                                       discount={this.state.discount}/>
                                    </Row>
                                </Col> :
                                <Col>
                                    {/*{(this.props.number !== undefined && this.props.number !== 0 &&*/}
                                        {/*this.props.retrieving) ?*/}
                                        {/*<View style={{flex: 1, paddingLeft: 15, alignItems: 'center'}}>*/}
                                            {/*<Text style={styles.text}>*/}
                                                {/*<FormattedMessage id="app.retrievingProducts"*/}
                                                                  {/*defaultMessage="Retrieving products..."/>*/}
                                            {/*</Text></View> :*/}
                                        <View style={{flex: 1, paddingLeft: 15, alignItems: 'center'}}>
                                            <Text style={styles.text}>
                                                <FormattedMessage id="app.noProducts"
                                                                  defaultMessage="Receipt doesn't contain any products"/>
                                            </Text></View>
                                    {/*}*/}
                                </Col>
                            }
                        </Row>
                        {this.props.dataSource.length > 0 ?
                            <Row size={4} style={{marginLeft: scale(-5), marginRight: scale(-5)}}>
                                {Array.apply(null, {length: max}).map((d, i) => {
                                    let item = paymentButtons[i] ? paymentButtons[i] : {};
                                    let width = item.w ? item.w : options[i] ? -1 : 1;
                                    let gap = width > 0 ? scale(5) : 0;
                                    let style = {
                                        marginTop: scale(10),
                                        marginLeft: gap,
                                        marginRight: gap
                                    };
                                    return (
                                        <Col key={i} size={width} style={style}>
                                            {item.name === 'button_2' &&
                                                <ButtonMeasures text="app.card" intl={this.props.intl}
                                                    onLongPress={(px, py) => {
                                                        this.payment_type = 'card';
                                                        this._numberPad.open(px, py)
                                                    }}
                                                    onPress={() => {
                                                        if (this.props.permissions && this.props.permissions['function_8']) {
                                                            if (!this.state.closeInProgress) {
                                                                this.setState({closeInProgress: true}, () => {
                                                                    if (!!item.method) {
                                                                        this.props.closeTicket([{
                                                                            uid: item.method,
                                                                            total: this.getTotalWithDiscount()
                                                                        }]);
                                                                    } else
                                                                        this.props.closeTicket([{
                                                                            type: 'card',
                                                                            total: this.getTotalWithDiscount()
                                                                        }]);
                                                                });
                                                            }
                                                        } else {
                                                            this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                                        }
                                                    }}
                                                    style={styles.innerButton}/>
                                            }

                                            {item.name === 'button_1' &&
                                                <ButtonItem text="app.pay" intl={this.props.intl}
                                                    onPress={() => {
                                                        if (this.props.permissions && this.props.permissions['function_8']) {
                                                            this._payment.open()
                                                        } else {
                                                            this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                                        }
                                                    }}
                                                    style={styles.innerButton}/>
                                            }

                                            {item.name === 'button_3' &&
                                                <ButtonMeasures text="app.cash" intl={this.props.intl}
                                                    onLongPress={(px, py) => {
                                                        this.payment_type = 'cash';
                                                        this._numberPad.open(px, py)
                                                    }}
                                                    onPress={() => {
                                                        if (this.props.permissions && this.props.permissions['function_8']) {
                                                            if (!this.state.closeInProgress) {
                                                                this.setState({closeInProgress: true}, () => {
                                                                    if (!!this.props.printerType && this.props.printerType !== 'mpop')
                                                                        this.props.openDrawer();
                                                                    else
                                                                        openCashDrawer(null, (text) => this._alert.open(text));
                                                                    if (!!item.method) {
                                                                        this.props.closeTicket([{
                                                                            uid: item.method,
                                                                            total: this.getTotalWithDiscount()
                                                                        }]);
                                                                    } else
                                                                        this.props.closeTicket([{
                                                                            type: 'cash',
                                                                            total: this.getTotalWithDiscount()
                                                                        }]);
                                                                });
                                                            }
                                                        } else {
                                                            this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                                        }
                                                    }}
                                                    style={styles.innerButton}/>
                                            }
                                        </Col>
                                    )
                                })}
                            </Row> : <Row size={4}/>
                        }
                    </Col>
                </Row>

                <Row size={1} style={{marginRight: scale(5), marginLeft: scale(5)}}>
                    <SwipeALot circleDefaultStyle={plainStyles.dotStyle} ref={elt => this._buttons = elt}
                               circleActiveStyle={plainStyles.activeDotStyle}>
                        {Array.apply(null, {length: Math.ceil(functions.length / 4)}).map((d, i) =>
                            <Row key={i} style={[styles.slide, {marginTop: 5}]}>
                                {Array.apply(null, {length: 4}).map((d, j) => {
                                    let idx = 4 * i + j;
                                    let styles = {};
                                    let image;
                                    if (!!functions[idx] && !!functions[idx].color)
                                        styles.backgroundColor = functions[idx].color;
                                    if (!!functions[idx] && !!functions[idx].image)
                                        image = Object.keys(functions[idx].image).map(image => functions[idx].image[image].downloadURL)[0];
                                    // let functionName = functions[idx] ? functions[idx].name.split(/[\/ ]/).join('_').toLowerCase() : '';
                                    let funcKey = functions[idx] ? functions[idx].functionKey : '';
                                    return idx < functions.length ?
                                        <IconButton key={j} price={functions[idx].name}
                                                    style={styles}
                                                    image={image}
                                                    onPress={(px, py) => this.onFuncPress(funcKey, functions[idx].uid, px, py)}
                                                    onLongPress={(px, py) => this.onFuncLongPress(funcKey, functions[idx].uid, px, py)}
                                                    {...functionParams[funcKey]}/> :
                                        <Col key={j}/>
                                })}
                            </Row>
                        )}
                    </SwipeALot>
                </Row>

                <ActionConfirm ref={elt => this._confirm = elt} intl={this.props.intl}
                               onOk={this.props.deleteTicket} explicitClosing>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.deleteReceipt"].toUpperCase()}</Text></Row>
                </ActionConfirm>

                <ActionConfirm ref={elt => this._returnInfo = elt} intl={this.props.intl} noButtons>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.returnInfo"]}</Text></Row>
                </ActionConfirm>

                <ActionConfirm ref={elt => this._confirmPark = elt} intl={this.props.intl}
                               onOk={this.props.parkTicket} explicitClosing>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.parkReceipt"].toUpperCase()}</Text></Row>
                </ActionConfirm>

                <ActionConfirm ref={elt => this._retrieving = elt} intl={this.props.intl} noButtons>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.retrieving"]}</Text></Row>
                </ActionConfirm>

                <ActionConfirm ref={elt => this._printing = elt} intl={this.props.intl} noButtons>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.printing"]}</Text></Row>
                </ActionConfirm>

                <ActionConfirm ref={elt => this._noReceipts = elt} intl={this.props.intl} noButtons>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.noClosedReceipts"]}</Text></Row>
                </ActionConfirm>

                <AlertPopup ref={elt => this._alert = elt} intl={this.props.intl}/>

                <TicketLine ref={elt => this._ticketLine = elt} arrow="right" intl={this.props.intl}
                            onOk={this.props.onOk} alert={text => this._alert.open(text) }/>
                <NumberPopup ref={elt => this._numberPad = elt} showDelimiter postfix="DKK" intl={this.props.intl}
                             alert={text => this._alert.open(text)}
                             onOk={(total) => {
                                 if (this.getTotalWithDiscount() > total)
                                     return;
                                 if (!this.state.closeInProgress) {
                                     this.setState({closeInProgress: true}, () =>
                                         this.props.closeTicket([{type: this.payment_type, total: total}])
                                     );
                                 }
                             }}
                             readOnly arrow="right"/>
                <NumberPopup ref={elt => this._discountPad = elt} showDelimiter postfix="%" max={100}
                             alert={text => this._alert.open(text)}
                             onOk={this.setTicketDiscount} intl={this.props.intl} readOnly arrow="right"/>
                <NumberPopup ref={elt => this._splitReceipt = elt} postfix="X" showDelimiter deleteAll
                             alert={text => this._alert.open(text)}
                             onOk={this.props.splitEqual} intl={this.props.intl} readOnly arrow="right"/>
                <Payment ref={elt => this._payment = elt} total={this.getTotalWithDiscount()} intl={this.props.intl}
                         onOk={(payments) => {
                             console.log('payments ', payments);
                             let products_for_scanner = this.props.dataSource.filter(line => {
                                 return (['type_4', 'type_5'].indexOf(line.product_type) > -1);
                             });
                             if (products_for_scanner.length > 0) {
                                 this._scanner.open(products_for_scanner);
                             }
                             if (!this.state.closeInProgress) {
                                 this.setState({closeInProgress: true}, () =>
                                     this.props.closeTicket(payments)
                                 );
                             }
                         }}/>

                <Scanner ref={elt => this._scanner = elt} intl={this.props.intl} onPress={(key) => this._chipCreator.open(key)}/>
                <ChipCreator ref={elt => this._chipCreator = elt} intl={this.props.intl} onSuccess={(uid, line_uid, type) =>
                    this._scanner.scan_chip(uid, line_uid, type)}/>
                <TablePicker ref={elt => this._tablePicker = elt} onPress={this.props.selectTable}
                             intl={this.props.intl}/>

                <SplitPayment ref={elt => this._splitPayment = elt} intl={this.props.intl}
                    permissions={this.props.permissions}
                    dataSource={this.props.dataSource}
                    dataSourceSplitted={this.props.dataSourceSplitted}
                    getTotalWithDiscount={this.getTotalWithDiscount}
                    splitEqual={this.props.splitEqual}
                    discount={this.state.discount}
                    closeTicket={this.props.closeTicket}
                    parkTicket={this.props.parkTicket}
                    updateLineWithSplit={this.props.updateLineWithSplit}
                    cloneDataSource={this.props.cloneDataSource}
                    dataSourceSplittedEqual={this.props.dataSourceSplittedEqual}
                    updateSplitEqual={this.props.updateSplitEqual}
                    />
            </View>
        )
    }
}


class FlickeringIcon extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: true
        }
    }

    componentDidMount() {
        let timeout = this.props.timeout || 400;
        this.timer = setInterval(() => {
            this.setState({
                show: !this.state.show
            })
        }, timeout);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        if (this.state.show)
            return (
                <Icon style={this.props.styles} name={this.props.name} size={this.props.size} color={this.props.color}/>
            );
        return <Text/>
    }
}
