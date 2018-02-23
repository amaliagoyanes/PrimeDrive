import axios from 'axios';
import React, {Component} from 'react';
import {
    Platform,
    TouchableOpacity,
    Text, AsyncStorage,
    View, Alert
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {Actions} from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import {connect} from 'react-redux';
import {updateIntl} from 'react-intl-redux';
import * as enMessages from '../translations/locales/en.json'
import * as messages from '../translations/locales/da.json'
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import Immersive from 'react-native-immersive';
import icoMoonConfig from '../fonts/selection.json';

const Icon = createIconSetFromIcoMoon(icoMoonConfig);
import {scale, scaleText} from '../scaling';

import StarIo from 'react-native-star-io';
import * as Terminal from 'react-native-verifone';
import {
    SideMenu,
    OpenDay,
    CloseDay,
    CheckInOut,
    UserLogin,
    AlertPopup,
    ActionConfirm,
    TerminalStatus,
    PrinterStatus,
    NetworkPrinterStatus,
    Layout,
    SubProducts,
    StatusSync,
    Timer
} from './index';
import {fetchReceipts} from '../api';
import {
    updateUserAuth,
    updateUserNumber,
    updatePrinterPort,
    updatePrinterAddress,
    updatePrinterConnectionType,
    updateCashShift,
    updatePermissions,
    updateClosedReceipts,
    updateParkedReceipts,
    updateCurrentReceipt,
    updateESCPrinterAddress,
    updateCashShiftListener
} from '../reducers/actions';
import firestack from '../fbconfig.js'
import styles from '../style/styles';

export class MainScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '', port: '', printerAddress: '', isUSB: false, escConnected: false, display: [],
            address: "", initialized: false, connected: false, transaction: false, connectInProgress: false,
            ticket: '', cash_shift_id: '', receipts_parked: null, receipts_closed: null, loaded: false
        };
        this.silentMode = false;
        this.retrieved_parked = false;
        this.started_receipts_parked = false;
        this.started_receipts_closed = false;
        let CancelToken = axios.CancelToken;
        this.source = CancelToken.source();

        this.loadData = this.loadData.bind(this);
        this.setPort = this.setPort.bind(this);
        this.setPrinterType = this.setPrinterType.bind(this);
        this.setPrinterAddress = this.setPrinterAddress.bind(this);
        this.setESCPrinterAddress = this.setESCPrinterAddress.bind(this);
        this.setAddress = this.setAddress.bind(this);
        this.getReceipts = this.getReceipts.bind(this);
        this.openReceiptsScreen = this.openReceiptsScreen.bind(this);
        this.handleClientUpdate = this.handleClientUpdate.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.endOfDay = this.endOfDay.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.init = this.init.bind(this);
        this.get_shift_id = this.get_shift_id.bind(this);
        this.get_permissions = this.get_permissions.bind(this);
        this.reopenShift = this.reopenShift.bind(this);
    }

    handleClientUpdate(snapshot) {
        this.loadData();
    }

    getReceipts(status, uid) {
        let cash_shift_id = !!uid ? uid : this.props.cash_shift_id;
        if (!!cash_shift_id && !!status && !this[`started_receipts_${status}`]) {
            this[`started_receipts_${status}`] = true;
            fetchReceipts('tickets', {object_uid: cash_shift_id, status: status}, this.source.token).then(data => {
                // let state = {};
                this[`started_receipts_${status}`] = false;
                // state[`receipts_${status}`] = data;
                if (status === 'parked') {
                    this.props.dispatch(updateParkedReceipts(data));
                    firestack.database.ref(`/cashShifts/${cash_shift_id}`).update({parked: data.length})
                        .then(() => {
                            setTimeout(() => {
                                if (!!this._layout && !!this._layout._ticketBlock) {
                                    this._layout._ticketBlock.updateListener(data.length);
                                }
                            }, 200);
                        }).catch();
                } else {
                    this.props.dispatch(updateClosedReceipts(data))
                }

                // this.setState(state);
            }).catch(err => console.log('GET RECEIPTS MAIN SCREEN err'));
        }
    }

    async init() {
        console.log('stated init');
        let _alert = this._alert;
        let _terminalInfo = this._terminalInfo;
        let _layout = this._layout;
        let _netprinterStatus = this._netprinterStatus;
        let t = this;
        const initialized = await Terminal.initialize({
            onDisplay: ({lineNumber, text}) => {
                console.log("onDisplay", lineNumber, text, /afbrud/gi.test(`${text}`));
                console.log("onDisplay", lineNumber, text, /fejl/.test(`${text}`));
                try {
                    let display = this.state.display;
                    display[lineNumber] = text;
                    this.setState({display: display});
                    // if (/afbrud/gi.test(text)) {
                    _layout._ticketBlock.closeFinished();
                    // }
                    if (/fejl/i.test(text)) {
                        // _layout._ticketBlock.closeFinished();
                        t.disconnect(true, false);
                    }
                    if (!this.silentMode && this.state.transaction) {
                        _terminalInfo.open(display.join('\n'));
                    }
                } catch (err) {
                    console.log(err);
                }
            },
            onPrint: ({text}) => {
                // this.setState({ receipt:text });
                if (!!this.props.printerType && this.props.printerType !== 'mpop')
                    _netprinterStatus.printText(text).then().catch();
                else {
                    let port = this.props.port;
                    if (port === null || port === undefined || port === '') {
                        StarIo.searchAndOpenPort().then((response) => {
                            if (!response.length) {
                                StarIo.createText(text);
                                _alert.open('No nearby printers found.');
                            } else {
                                this.props.dispatch(updatePrinterPort(response[0].port));
                                StarIo.printText(null, text);
                            }
                        }).catch(err => {
                            _alert.open('No printers found.');
                            if (callback !== undefined) callback();
                        })
                    } else {
                        StarIo.printText(null, text);
                    }
                }
            },
            onAdviceFlag: () => {
                _alert.open("AFSTEM!");
                this.endOfDay();
            }
        });
        console.log('initialized', initialized);

        this.setState({initialized}, () => {
            if (this.state.address !== '') {
                this.silentMode = true;
                setTimeout(() => {
                    try {
                        let res = this.disconnect(true, true);
                    } catch (err) {
                        console.log(err);
                    }
                }, 2500);
            }
        });
    }

    endOfDay() {
        try {
            this.silentMode = true;
            Terminal.admin(Terminal.AdminFunction.ENDOFDAY).then(success => {
                console.log("END OF DAY", success);
                this.silentMode = false;
            }).catch(err => {
                console.log('END OF DAY ERR', err);
                this.silentMode = false;
            });
        } catch (err) {
            console.log('END OF DAY ERR', err);
        }
    }

    async close() {
        const success = await Terminal.close();
        console.log("CLOSE", success);
    }

    async open() {
        const success = await Terminal.open();
        console.log("OPEN", success);
    }

    async disconnect(noAlert, reconnect) {
        console.log('DISCONNECTING');
        const connected = !(await Terminal.disconnect());
        if (!connected)
            this.setState({connected});
        else if (!noAlert)
            this._alert.open("Error occurred during disconnection from terminal. Please check terminal address and your network connection");
        if (reconnect)
            this.connect(noAlert, reconnect);
        console.log("DISCONNECT: ", !connected);

    }

    async connect(noAlert, reconnect) {
        const {address} = this.state;
        console.log('doing something');
        if (!/([^:]+):([0-9]*$)/.test(this.state.address)) {
            this._alert.open("Incorrect terminal address. Please type it in IP:port format");
            return;
        } else {
            this.setState({connectInProgress: true});
        }
        const [match, ip, port] = address.match(/([^:]+):([0-9]*$)/);
        try {
            const connected = await Terminal.connect({type: "IP", ip, port: parseInt(port)});
            if (reconnect)
                this.silentMode = false;
            this.setState({connected}, () => {
                if (connected)
                    AsyncStorage.setItem('@PrimeDrive:terminalAddress', this.state.address);
            });
            if (!connected)
                this._alert.open("Error occurred during connection to terminal. Please check terminal address and your network connection");
            console.log("CONNECT: ", connected);
        } catch (error) {
            console.log("error");
            if (!noAlert)
                this._alert.open("Error occurred during connection to terminal. Please check terminal address and your network connection");
        }
    }

    setAddress(address) {
        this.setState({address: address});
    }

    loadData() {
        AsyncStorage.getItem('@PrimeDrive:user').then((value) => {
            if (value === null) {
                Actions.login();
            } else {
                value = JSON.parse(value);
                this.setState({name: value.user.displayName});
                firestack.database.ref(`/users/${value.user.uid}`).once('value').then((snapshot) => {
                    const val = snapshot.val();
                    let customerLayout = val.settings.layout;
                    let langSetting = val.settings.lang;
                    let address = val.settings.verifone_terminal_ip;
                    let printerType = val.settings.printer_type;
                    let printerAddr = val.settings.printer_ip;
                    let isUSB = val.settings.usb_printer;
                    if (this.props.from === 'login') {
                        let lang = {
                            da: {locale: 'da', messages: messages},
                            en: {locale: 'en', messages: enMessages}
                        };
                        if (langSetting !== undefined) {
                            this.props.dispatch(updateIntl(lang[langSetting]));
                            AsyncStorage.setItem('@PrimeDrive:last_lang', langSetting);
                        }
                    }
                    let dealer_uid = /admin|dealer/.test(val.role) ? value.user.uid : val.dealer_uid;
                    let customer_uid = /admin|dealer|customer/.test(val.role) ? value.user.uid : val.customer_uid;
                    let departmentId = '';
                    if (val !== null) {
                        if (val.settings !== undefined && val.settings.department !== undefined)
                            departmentId = val.settings.department;
                        else if (Object.keys(val.client_departments).length)
                            departmentId = Object.keys(val.client_departments)[0];
                    }
                    AsyncStorage.getItem('@PrimeDrive:client').then((client) => {
                        let name = DeviceInfo.getDeviceName();
                        if (name === 'Unknown')
                            name = DeviceInfo.getModel();
                        if (!name || name === undefined) {
                            name = 'Tablet';
                        }
                        if (this.props.from === 'login') {
                            let data = {
                                dealer_uid: dealer_uid, customer_uid: customer_uid, name: name,
                                layoutId: customerLayout
                            };
                            try {
                                data.departmentId = departmentId;
                            } catch (err) {
                            }
                            firestack.database.ref(`/clients/${client}`).set(data)
                        }
                        firestack.database.ref(`/clients/${client}`).once('value').then(snapshot => {
                            let clientVal = snapshot.val();
                            let layout = clientVal !== null && clientVal.layoutId ? clientVal.layoutId : customerLayout;
                            let departmentId = clientVal !== null ? clientVal.departmentId : '';
                            address = clientVal !== null && !!clientVal.verifone_terminal_ip ? clientVal.verifone_terminal_ip : address;
                            printerType = clientVal !== null && !!clientVal.printer_type ? clientVal.printer_type : printerType;
                            printerAddr = clientVal !== null && !!clientVal.printer_ip ? clientVal.printer_ip : printerAddr;
                            isUSB = clientVal !== null && !!clientVal.usb_printer ? clientVal.usb_printer : isUSB;
                            let newProps = {
                                uid: value.user.uid, settings: val.settings,
                                customer_uid: customer_uid, dealer_uid: dealer_uid, client_id: client,
                                layout: layout, client_name: clientVal ? clientVal.name : name,
                                departmentId: departmentId
                            };
                            if (!!printerType)
                                newProps.printerType = printerType;
                            if (!!printerAddr)
                                newProps.escPrinterAddress = printerAddr;
                            if (!!isUSB)
                                newProps.isUSB = isUSB;


                            AsyncStorage.getItem('@PrimeDrive:user_uid').then(user_uid => {
                                if (!!address) {
                                    this.setState({address: address, loaded: true});
                                }
                                newProps.user_uid = user_uid;
                                this.get_permissions();
                                this.props.dispatch(updateUserAuth(newProps));
                            }).catch()
                        });
                        this.getReceipts('parked');
                        this.getReceipts('closed');
                    });
                })
            }
        }).catch(err => {
            console.log(err);
            Actions.login()
        });
    }

    get_shift_id() {
        AsyncStorage.getItem('@PrimeDrive:last_shift_uid').then((uid) => {
            this.props.dispatch(updateCashShift(uid));
            if (uid === null && !this.retrieved_parked) {
                AsyncStorage.getItem('@PrimeDrive:last_closed_shift_uid').then(val => {
                    if (!!val && (this.props.parked_receipts === null || !this.props.parked_receipts.length)) {
                        val = JSON.parse(val);
                        this.retrieved_parked = true;
                        this.getReceipts('parked', val.uid);
                    }
                });
            }
        }).catch(err => {
            console.log('err', err)
        });
    }

    get_permissions() {
        AsyncStorage.getItem('@PrimeDrive:user_info')
            .then(info => {
                info = JSON.parse(info);
                // this.props.permissions = info.permissions || {};
                let permissions = !!info ? info.permissions : {};
                this.props.dispatch(updatePermissions(permissions));
                try {
                    this._userLogin.login(info.number);
                    this.props.dispatch(updateUserNumber(info.number));
                } catch (err) {
                    console.log('LOGIN ERR', err)
                }
            })
            .catch(err => console.log(err));
    }

    componentDidMount() {
        this.loadData();
        this.get_shift_id();

        if (this.props.ticket === undefined && this.props.ticket !== null) {
            AsyncStorage.getItem('@PrimeDrive:printerAddress').then(printerAddress => {
                if (printerAddress !== null) {
                    this.props.dispatch(updatePrinterAddress(printerAddress));
                }
            });

            AsyncStorage.getItem('@PrimeDrive:isUSBPrinter').then(isUSB => {
                if (isUSB !== null) {
                    isUSB = isUSB === 'true';
                    this.props.dispatch(updatePrinterConnectionType(isUSB));
                }
            });

            AsyncStorage.getItem('@PrimeDrive:printerPort').then(port => {
                if (port !== null) {
                    StarIo.openPort(port).then().catch(() => {
                        StarIo.searchAndOpenPort().then((response) => {
                            if (response.length) {
                                this.props.dispatch(updatePrinterPort(response[0].port));
                            }
                        });
                    })
                }
            });
            AsyncStorage.getItem('@PrimeDrive:terminalAddress').then(address => {
                if (address !== null) {
                    this.setState({address: address}, () => this.init());
                } else {
                    this.init();
                }
            });
        }

        // this.timer = setInterval(() => {
        //     this.setState({
        //         curTime: moment().format('HH:mm:ss - DD.MM.YYYY')
        //     })
        // }, 1000);
    }

    componentDidUpdate(props, state) {
        Immersive.on();
        Immersive.setImmersive(true);
        if (!this.props.cash_shift_id) {
            this.get_shift_id();
        }
        if (!this.props.permissions) {
            this.get_permissions();
        }
        // this.get_permissions();
        if (this.props.shouldUpdate && !!this._layout) {
            this._layout.resetLayout();
            this.props.dispatch(updateCashShiftListener(false));
            this._layout.updateCashShiftListener();
        }

        if (props.client_id !== this.props.client_id) {
            if (props.client_id && props.client_id !== this.props.client_id)
                firestack.database.ref(`/layouts/${props.client_id}/`).off('value');

            firestack.database.ref(`/clients/${this.props.client_id}/`).on('value', this.handleClientUpdate);
        }

        if (!!this.props.current_receipt && Object.keys(this.props.current_receipt).length > 0) {
            this._layout.getTicketData(this.props.current_receipt);
            this.props.dispatch(updateCurrentReceipt({}));
        }

        if (!this.state.transaction && state.transaction) {
            this.setState({display: []});
            this._terminalInfo.close();
        }
    }

    componentWillUnmount() {
        // clearInterval(this.timer);
        firestack.database.ref(`/clients/${this.props.client_id}/`).off('value')
    }

    setPort(port) {
        this.props.dispatch(updatePrinterPort(port));
    }

    setPrinterAddress(address) {
        this.props.dispatch(updatePrinterAddress(address));
    }

    setESCPrinterAddress(address) {
        this.props.dispatch(updateESCPrinterAddress(address));
    }

    setPrinterType(isUSB) {
        this.props.dispatch(updatePrinterConnectionType(isUSB));
    }

    openReceiptsScreen(data, name) {
        Actions.receipts({
            name: name === undefined ? 'parkedReceipts' : name,
            cash_shift_id: this.props.cash_shift_id
        });
    }

    reopenShift() {
        this._closeDay.forceCloseDay(() => {
            if (!!this.props.settings.verifone_terminal && !!this.props.settings.end_of_day) {
                try {
                    this.endOfDay();
                } catch (err) {
                    console.log(err);
                }
            }
            this._openDay.openDay();
        });
    }

    render() {
        let lang = {
            da: {locale: 'da', messages: messages},
            en: {locale: 'en', messages: enMessages}
        };
        return (
            <Grid style={styles.container}>
                <Row style={{height: scale(35), alignItems: 'flex-start'}}>
                    <Col size={0.075} style={{height: scale(35), alignItems: 'center', justifyContent: 'center'}}>
                        <Icon style={[styles.icon, {top: scale(5)}]} name="logo" size={scaleText(25)} color="white"/>
                    </Col>
                    <Col size={0.175} style={{height: scale(35), alignItems: 'flex-start', justifyContent: 'center'}}>
                        <Text style={styles.text}>PrimeDrive</Text>
                    </Col>
                    <Col size={0.5} style={{height: scale(35), alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={[styles.text, {fontSize: scaleText(10)}]}>
                            KL. <Timer reopenShift={this.reopenShift} settings={this.props.settings}
                                       ref={elt => this._timer = elt}/>
                        </Text>
                    </Col>
                    <Col size={0.25} style={{
                        height: scale(35),
                        marginRight: scale(10),
                        alignItems: 'flex-end',
                        justifyContent: 'center'
                    }}>
                        <Text style={styles.text}>{this.state.name}</Text>
                    </Col>
                </Row>
                <Row name="navbar" style={{height: scale(42)}}>
                    <Col size={5}>
                        <TouchableOpacity style={[styles.flex, {padding: scale(5)}]} onPress={() => this._menu.open()}>
                            <Icon style={styles.icon} name="menu" size={scaleText(22)} color="white"/>
                        </TouchableOpacity>
                    </Col>
                    <Col size={85}/>
                    <Col size={5}>
                        <TouchableOpacity style={[styles.flex, {padding: scale(5)}]} onPress={() => {
                            this._layout.resetLayout();
                        }}>
                            <Icon style={styles.icon} name="home" size={scaleText(20)} color="white"/>
                        </TouchableOpacity>
                    </Col>
                    <Col size={5}>
                        <TouchableOpacity style={[styles.flex, {padding: scale(5)}]}
                                          onPress={() => Actions.userLogin()}>
                            <Icon style={styles.icon} name="person" size={scaleText(20)} color="white"/>
                        </TouchableOpacity>
                    </Col>
                    {/*<Col size={5}>*/}
                    {/*<TouchableOpacity style={[styles.flex, {padding: scale(5)}]}*/}
                    {/*onPress={() => this._subProducts.open()}>*/}
                    {/*<Icon style={styles.icon} name="search" size={scaleText(20)} color="white"/>*/}
                    {/*</TouchableOpacity>*/}
                    {/*</Col>*/}
                </Row>
                <Layout openModal={(modal) => this['_' + modal].open()} uid={this.props.uid}
                        dispatch={this.props.dispatch} transaction={this.state.transaction}
                        setTransaction={(state, callback) => this.setState({transaction: state}, callback)}
                        openUserLogin={() => Actions.userLogin()} getReceipts={this.getReceipts}
                        intl={this.props.intl} ref={elt => this._layout = elt} port={this.props.port}
                        layout={this.props.layout} client_id={this.props.client_id}
                        departmentId={this.props.departmentId} user_uid={this.props.user_uid}
                        customer_uid={this.props.customer_uid} dealer_uid={this.props.dealer_uid}
                        settings={this.props.settings} connected={this.state.connected}
                        address={this.state.address} connect={this.connect} shouldUpdate={this.props.shouldUpdate}
                        updateCashShiftListener={(val) => this.props.dispatch(updateCashShiftListener(val))}
                        printerType={this.props.printerType}
                        print={!!this._netprinterStatus ? this._netprinterStatus.print : () => console.log()}
                        openDrawer={() => this._netprinterStatus.openDrawer()}
                        updateParkedReceipts={(parkedReceipt) => {
                            let receipts = this.props.parked_receipts;
                            if (receipts && receipts.length) {
                                receipts.forEach(receipt => {
                                    if (receipt.number === parkedReceipt.number && receipt.timestamp === parkedReceipt.timestamp) {
                                        receipt.total = parkedReceipt.total;
                                        if (!!parkedReceipt.ticket_lines)
                                            receipt.ticket_lines = parkedReceipt.ticket_lines;
                                    }
                                })
                            }
                            this.props.dispatch(updateParkedReceipts(receipts));
                        }}
                        deleteParkedReceipt={(parkedReceipt) => {
                            let receipts = this.props.parked_receipts;
                            if (receipts && receipts.length) {
                                receipts = receipts.filter(receipt => {
                                    return receipt.number === parkedReceipt.number && receipt.timestamp === parkedReceipt.timestamp;
                                });
                            }
                            this.props.dispatch(updateParkedReceipts(receipts));
                        }}
                        openParkedReceipts={() => this.openReceiptsScreen(this.state.receipts_parked, 'parkedReceipts')}
                        openClosedReceipts={() => this.openReceiptsScreen(this.state.receipts_closed, 'closedReceipts')}
                        ticket={this.props.ticket} cash_shift_id={this.props.cash_shift_id}
                        permissions={this.props.permissions}/>
                <SideMenu ref={elt => this._menu = elt} intl={this.props.intl}
                          openModal={(modal) => this['_' + modal].open()}
                          cash_shift_id={this.props.cash_shift_id}
                          alert={text => this._alert.open(text)} printerType={this.props.printerType}
                          openParkedReceipts={() => this.openReceiptsScreen(this.state.receipts_parked, 'parkedReceipts')}
                          openClosedReceipts={() => this.openReceiptsScreen(this.state.receipts_closed, 'closedReceipts')}
                          updateLang={lng => this.props.dispatch(updateIntl(lang[lng]))}
                          permissions={this.props.permissions}/>
                <StatusSync user_uid={this.props.user_uid} client_name={this.props.client_name}
                            userNumber={this.props.userNumber} forceSync={this.loadData}/>

                <OpenDay ref={elt => this._openDay = elt} departmentId={this.props.departmentId}
                         openUserLogin={() => this._userLogin.open()} intl={this.props.intl}
                         user_uid={this.props.user_uid} client_id={this.props.client_id}
                         customer_uid={this.props.customer_uid} dealer_uid={this.props.dealer_uid}
                         printerType={this.props.printerType} settings={this.props.settings}
                         print={(receipt, isSummary) => this._netprinterStatus.print(receipt, isSummary)}
                         openDrawer={() => this._netprinterStatus.openDrawer()}
                         alert={text => this._alert.open(text)}
                         updateCashShift={(uid) => {
                             this.props.dispatch(updateCashShift(uid));
                             if (this.props.parked_receipts && this.props.parked_receipts.length) {
                                 this.props.parked_receipts.forEach(receipt => {
                                     receipt.cash_shift_id = uid;
                                     firestack.database.ref(`/tickets/${receipt.uid}`).update({cash_shift_id: uid}).then().catch();
                                     if (!!receipt.ticket_lines) {
                                         console.log(Object.keys(receipt.ticket_lines));
                                         Object.keys(receipt.ticket_lines).forEach(line => {
                                             receipt.ticket_lines[line].cash_shift_id = uid;
                                             firestack.database.ref(`/ticketLines/${line}`).update({cash_shift_id: uid}).then().catch();
                                         })
                                     }
                                 });
                             }

                             this.getReceipts('parked', uid);
                             this.getReceipts('closed', uid);
                         }}/>
                <CloseDay ref={elt => this._closeDay = elt} user_uid={this.props.user_uid}
                          settings={this.props.settings} endOfDay={this.endOfDay} connected={this.state.connected}
                          openUserLogin={() => Actions.userLogin()} intl={this.props.intl}
                          printerType={this.props.printerType} loaded={this.state.loaded}
                          print={(receipt, isSummary) => this._netprinterStatus.print(receipt, isSummary)}
                          openDrawer={() => this._netprinterStatus.openDrawer()}
                          customer_uid={this.props.customer_uid}
                          alert={text => this._alert.open(text)}
                          cash_shift_id={this.props.cash_shift_id}
                          updateCashShift={(uid) => {
                              this.props.dispatch(updateCashShift(uid));
                              this.setState({receipts_parked: null, receipts_closed: null})
                          }}/>
                <CheckInOut ref={elt => this._checkInOut = elt} intl={this.props.intl}
                            user_uid={this.props.user_uid} client_id={this.props.client_id}
                            customer_uid={this.props.customer_uid} dealer_uid={this.props.dealer_uid}/>
                <SubProducts ref={elt => this._subProducts = elt} intl={this.props.intl}/>
                <UserLogin ref={elt => this._userLogin = elt} dispatch={this.props.dispatch} intl={this.props.intl}
                           token={this.props.token} openShift={() => this._openDay.open()}/>
                <PrinterStatus ref={elt => this._printerStatus = elt} intl={this.props.intl}
                               port={this.props.port} address={this.props.printerAddress}
                               isUSB={this.props.isUSB} setPort={this.setPort}
                               alert={text => this._alert.open(text)}
                               setPrinterAddress={this.setPrinterAddress}
                               setPrinterType={this.setPrinterType}/>
                <TerminalStatus ref={elt => this._terminalStatus = elt} intl={this.props.intl}
                                address={this.state.address} setAddress={this.setAddress}
                                connect={this.connect} disconnect={this.disconnect}
                                open={this.open} close={this.close} endOfDay={this.endOfDay}
                                connectInProgress={this.state.connectInProgress}
                                connected={this.state.connected} initialized={this.state.initialized}/>
                <NetworkPrinterStatus ref={elt => this._netprinterStatus = elt} intl={this.props.intl}
                                      isUSB={this.props.isUSB} address={this.props.escPrinterAddress}
                                      listening={this.props.listening} printerType={this.props.printerType}
                                      connected={this.state.escConnected}
                                      setPrinterAddress={this.setESCPrinterAddress}
                                      setPrinterType={this.setPrinterType}
                                      setPrinterStatus={(status) => this.setState({escConnected: status})}
                                      alert={text => this._alert.open(text)}
                                      open={this.open} close={this.close}/>
                <ActionConfirm ref={elt => this._terminalInfo = elt} onlyCancelButton explicitClosing
                               intl={this.props.intl} onOk={(data) => console.log('closed')}
                               onCancel={() => {
                                   try {
                                       this._layout._ticketBlock.abort();
                                   } catch (err) {
                                       console.log("ABORT ERR", err)
                                   }
                               }}/>
                <AlertPopup ref={elt => this._alert = elt} intl={this.props.intl}/>
            </Grid>
        )
    }
}

export default connect(({app, intl, receipts}) => ({
    uid: app.uid, token: app.token, user_uid: app.user_uid, user_number: app.user_number, layout: app.layout,
    port: app.port, printerAddress: app.printerAddress, isUSB: app.isUSB, userNumber: app.userNumber,
    printerType: app.printerType, escPrinterAddress: app.escPrinterAddress,
    customer_uid: app.customer_uid, dealer_uid: app.dealer_uid, departmentId: app.departmentId, settings: app.settings,
    client_id: app.client_id, client_name: app.client_name, cash_shift_id: app.cash_shift,
    current_receipt: receipts.current_receipt, parked_receipts: receipts.parked_receipts,
    permissions: app.permissions, intl: intl, shouldUpdate: app.shouldUpdate
}))(MainScreen)