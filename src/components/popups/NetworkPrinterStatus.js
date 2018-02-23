import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text, Platform, Switch, TextInput,
    AsyncStorage
} from 'react-native';

import StarIo from 'react-native-star-io';
import RNFetchBlob from 'react-native-fetch-blob';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import '../../../shim';
import net from 'react-native-tcp';
import {scale, scaleText} from '../../scaling'
import {toFixedLocale, toFixedLocaleDa} from '../plain/receipts/plainComponents';
import {RNUSBPrinter} from 'react-native-usb-printer';


const Buffer = require('buffer/').Buffer;
const fs = RNFetchBlob.fs;

export default class NetworkPrinterStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, inputMode: false, currentPrinter: false,
            address: props.address,
        };

        this.commands = {};
        this.commands.openDrawer = Buffer.from([0x1b, 0x70, 0x30, 0xf0, 0xf0, 0x1b, 0x70, 0x31, 0xf0, 0xf0]);
        this.commands.initialize = Buffer.from([0x1b, 0x40]);
        this.commands.denmark = Buffer.from([0x1b, 0x52, 10]);
        this.commands.nordic = Buffer.from([0x1B, 0x74, 0x05]);
        this.commands.feed = Buffer.from([0x1b, 0x64, 0x05, 0x1d, 0x56, 0x65, 0]);
        this.commands.cut = Buffer.from([0x1C, 0x28, 0x4C, 0x02, 0x00, 0x42, 49, 0x1d, 0x56, 0]);
        this.waitForEnd = false;
        this.initStarted = false;

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.openPort = this.openPort.bind(this);
        this.openDrawer = this.openDrawer.bind(this);
        this.print = this.print.bind(this);
        this.toggleUSB = this.toggleUSB.bind(this);
        this.initSocket = this.initSocket.bind(this);
        this.initUSB = this.initUSB.bind(this);
    }

    open() {
        this.setState({open: true, address: this.props.address})
    }

    close() {
        this.setState({open: false, address: null, inputMode: false})
    }

    openPort() {
        if (this.props.isUSB) {
            this.initUSB().then(() => {
                console.log('EXECUTED?');
                this.props.setPrinterStatus(true);
            }).catch(() => {
                this.props.setPrinterStatus(false);
            });
        } else if (this.state.address !== null && this.state.address !== '') {
            AsyncStorage.setItem('@PrimeDrive:escPrinterAddress', this.state.address);
            this.props.setPrinterAddress(this.state.address);
            this.setState({inputMode: false});
            this.initSocket().then(() => {
                console.log('EXECUTED?');
                this.props.setPrinterStatus(true);
            }).catch(() => {
                this.props.setPrinterStatus(false);
            })
        }
    }

    async initUSB() {
        this.initStarted = true;
        if (Platform.OS === 'android') {
            try {
                let devices = await RNUSBPrinter.getUSBDeviceList();
                let printedSelected = await this.connectPrinter();
                if (!this.state.currentPrinter && printedSelected)
                    this.props.setPrinterStatus(true);
                if (this.state.currentPrinter && !printedSelected)
                    this.props.setPrinterStatus(false);
                this.setState({currentPrinter: printedSelected}, () => {
                    this.initStarted = false;
                });
            } catch (error) {
                this.props.alert(`${error}`);
            }
        }
    }

    async connectPrinter() {
        let vendorId, productId;
        switch (this.props.printerType) {
            case 'escpos88':
                vendorId = 1208;
                productId = 514;
                break;
            case 'citizen':
                vendorId = 7568;
                productId = 8288;
                break;
            case 'aures':
                vendorId = 1317;
                productId = 42752;
                break;
            case 'bixilon':
                vendorId = 5380;
                productId = 29;
                break;
            default:
                vendorId = 1208;
                productId = 3605; //514;
        }
        return await RNUSBPrinter.connectPrinter(vendorId, productId);
    }

    async openDrawer() {
        if (this.props.isUSB) {
            console.log('called usb');
            if (this.state.currentPrinter && this.state.currentPrinter !== undefined) {
                try {
                    RNUSBPrinter.openDrawer();
                } catch (e) {
                    this.props.alert(`USB printer is not connected. ${e}`);
                }
            } else
                this.props.alert('USB printer is not connected.');
        } else {
            try {
                let res = await this.sendMessage(this.commands.openDrawer);
                console.log('done')
            } catch (e) {
                console.log(e);
            }
        }
    }

    async printText(text) {
        if (!!this.connection && !this.props.isUSB) {
            try {
                this.connection.destroy();
            } catch (err) {
            }
        }

        if (this.props.isUSB) {
            if (this.state.currentPrinter)
                RNUSBPrinter.printBillTextWithCut(text);
            else
                this.props.alert('USB printer not found')
        } else {
            this.initSocket().then(() => {
                this.waitForEnd = true;
                this.connection.write(text);
                this.connection.write(this.commands.feed);
                this.connection.write(this.commands.cut);
                this.waitForEnd = false;
            }).catch(err => {
                this.props.alert('connection error');
                this.props.setPrinterStatus(false);
            });
        }

        console.log('called text print');
    }

    async getImage(path) {
        let imagePath = null;
        let base64Data = await RNFetchBlob.config({fileCache: true}).fetch('GET', path)
            .then((resp) => {
                imagePath = resp.path();
                return resp.readFile('base64')
            });
        fs.unlink(imagePath);
        return base64Data
    }

    async print(receipt, isSummary, callback) {
        try {
            if (!!this.connection && !this.props.isUSB) {
                try {
                    this.connection.destroy();
                } catch (err) {
                }
            }
            if (receipt.discount !== undefined && !isSummary) {
                receipt.discount.value = toFixedLocaleDa(receipt.discount.value);
                receipt.discount.name = receipt.discount.name.replace('-', '');
            }

            let logo = null;
            if (!!receipt.logo) {
                try {
                    logo = await this.getImage(receipt.logo);
                } catch (err) {
                }
            }
            if (this.props.isUSB) {
                if (this.state.currentPrinter) {
                    StarIo.getMessage(JSON.stringify(receipt), isSummary).then(data => {
                        if (!!logo) {
                            RNUSBPrinter.printBillTextWithImage(data.message, logo);
                        } else
                            RNUSBPrinter.printBillTextWithCut(data.message);
                        if (!!callback && typeof callback === 'function')
                            callback();
                    }).catch(error => {
                        if (!!callback && typeof callback === 'function')
                            callback();
                        this.props.alert(`${error}`);
                    });
                } else {
                    this.props.alert('USB printer not found');
                    if (!!callback && typeof callback === 'function')
                        callback();
                }
            } else {
                this.initSocket().then(() => {
                    this.waitForEnd = true;
                    console.log('initialize command');
                    this.connection.write(this.commands.initialize);
                    console.log('denmark command');
                    this.connection.write(this.commands.nordic);
                    this.connection.write(this.commands.denmark);
                    StarIo.getMessage(JSON.stringify(receipt), isSummary).then(data => {
                        console.log('MESSAGE TO PRINT', data);
                        // data.message = data.message.replace('æ', 'ae');
                        // data.message = data.message.replace('ø', 'o');
                        // data.message = data.message.replace('å', 'a');
                        if (!!logo) {
                            let message = btoa(data.message);
                            message = logo + message;
                            this.connection.write(Buffer.from(message, 'base64'));
                        } else
                            this.connection.write(data.message);
                        console.log('feedAndCut command');
                        this.connection.write(this.commands.feed);
                        this.connection.write(this.commands.cut);
                        this.waitForEnd = false;
                        if (!!callback && typeof callback === 'function')
                            callback();
                    }).catch(err => {
                        console.log('MESSAGE ERR', err);
                        if (!!callback && typeof callback === 'function')
                            callback();
                    });
                }).catch(err => {
                    this.props.alert('connection error');
                    this.props.setPrinterStatus(false);
                    if (!!callback && typeof callback === 'function')
                        callback();
                });
            }
        } catch(err) {
            if (!!callback && typeof callback === 'function')
                callback();
        }
        console.log('called');
    }

    async sendMessage(buf) {
        if (this.props.address === undefined) {
            this.props.alert(this.props.intl.messages['app.invalidIPAddress']);
        } else {
            let addr = this.props.address.split(":");
            if (addr.length !== 2)
                this.props.alert(this.props.intl.messages['app.invalidIPAddress']);
            else if (this.listening) {
                this.connection.write(buf);
            } else {
                // this.connection.binaryType = 'arraybuffer';
                // this.connection.send(buf);
                this.initSocket().then(() => {
                    this.connection.write(buf);
                    setTimeout(() => {
                        try {
                            this.connection.destroy();
                        } catch (err) {
                        }
                    }, 2000);
                }).catch(err => {
                    // this.props.alert('connection error');
                    this.listening = false;
                    try {
                        this.connection.destroy();
                    } catch (err) {
                    }
                    this.props.setPrinterStatus(false);
                })
                // this.initSocket();
            }
        }
    }

    componentDidUpdate(props, state) {
        if (this.props.address !== props.address) {
            this.setState({address: this.props.address});
            console.log(this.props.address);
            if (!!this.props.address && this.props.address.split(":").length === 2) {
                // this.initSocket();
            }
        }
        if (this.props.isUSB && !this.initStarted && !this.state.currentPrinter) {
            console.log('ATTEMPT TO INIT USB');
            this.initUSB();
        }
    }

    initSocket() {
        return new Promise((resolve, reject) => {
            let addr = this.props.address.split(":");
            try {
                this.connection = net.createConnection(addr[1], addr[0], () => {
                    // this.props.alert('connected to escpos printer');
                    console.log('CONNECTED');
                    this.listening = true;
                    resolve();
                });
                this.connection.on("error", (err) => {
                    console.log("Error! " + err);
                    this.listening = false;
                    this.props.setPrinterStatus(false);
                    try {
                        this.connection.destroy()
                    } catch (err) {
                    }
                });
                this.connection.on('data', (data) => {
                    console.log('message was received', data);
                    if (!this.waitForEnd) {
                        try {
                            this.connection.destroy();
                        } catch (err) {
                        }
                        this.listening = false;
                    }
                });
                this.connection.on("close", () => {
                    console.log("Closed...");
                });
            } catch (err) {
                reject();
            }
        });
    }

    componentDidMount() {
        if (!!this.props.address && this.props.address.split(":").length === 2 && !(!!this.props.isUSB)) {
            this.initSocket();
        }
    }

    componentWillUnmount() {
        try {
            this.connection.destroy();
        } catch (err) {
        }
    }

    toggleUSB(val) {
        AsyncStorage.setItem('@PrimeDrive:isUSBPrinter', val.toString());
        this.props.setPrinterType(val);
    }

    render() {
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: Dimensions.get('screen').height * 0.25,
                        left: Dimensions.get('screen').width * 0.2,
                        width: Dimensions.get('screen').width * 0.6,
                        height: Dimensions.get('screen').height * 0.45,
                        backgroundColor: '#e3e5e6'
                    }}>
                        <Row size={0.75} style={{alignItems: 'flex-start', justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={this.close}
                                              style={[styles.timesIcon, {
                                                  marginTop: 0, marginLeft: scale(32), padding: scale(5),
                                                  backgroundColor: 'transparent'
                                              }]}>
                                <Icon size={scaleText(20)} name="close" color="#313138"/>
                            </TouchableOpacity>
                        </Row>
                        <Row size={0.5}
                             style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                {this.props.intl !== undefined && this.props.intl.messages["app.currentPrinterStatus"]}{' '}
                                {this.props.connectInProgress ?
                                    <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                        {this.props.intl.messages["app.connecting"]}</Text> :
                                    this.props.connected ?
                                        <Text style={[styles.text, {color: '#2dab61', fontSize: scaleText(13)}]}>
                                            {this.props.intl.messages["app.connected"]}</Text> :
                                        <Text style={[styles.text, {color: '#e84b3a', fontSize: scaleText(13)}]}>
                                            {this.props.intl.messages["app.disconnected"]}
                                        </Text>
                                }
                            </Text>
                        </Row>

                        <Row size={0.75}
                             style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                {this.props.intl !== undefined && this.props.intl.messages["app.currentPrinterAddress"]} {this.props.address}
                            </Text>
                        </Row>
                        <Row size={0.5}>
                            <TouchableOpacity onPress={() => this.toggleUSB(!this.props.isUSB)}
                                              style={[styles.buttonSidedText, {width: '100%'}]}>
                                <Col/>
                                <Col style={{alignItems: 'center', justifyContent: 'center'}} size={5}>
                                    <Text>{this.props.intl !== undefined && this.props.intl.messages["app.useAsUSBPrinter"]}</Text>
                                </Col>
                                <Col style={{alignItems: 'flex-start', justifyContent: 'center'}} size={1}>
                                    <Switch value={this.props.isUSB} onTintColor='#3cb671'/>
                                </Col>
                            </TouchableOpacity>
                        </Row>
                        {this.state.inputMode ?
                            <Row size={1.25} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                <Col style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                    <Row size={0.75}>
                                        <TextInput
                                            onChange={(event) => this.setState({address: event.nativeEvent.text})}
                                            style={[styles.text, styles.tableNameChangeInput]}
                                            autoFocus={false}/>
                                    </Row>
                                    <Row style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                        <TouchableOpacity onPress={() => this.setState({inputMode: false})}
                                                          style={[styles.tabButton, styles.confirmBtn,
                                                              {height: scale(60), backgroundColor: 'transparent',}]}>
                                            <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                                {this.props.intl !== undefined && this.props.intl.messages["app.cancelUpper"]}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.openPort}
                                                          style={[styles.tabButton, styles.confirmBtn,
                                                              {height: scale(60)}]}>
                                            <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                                {this.props.intl !== undefined && this.props.intl.messages["app.okUpper"]}</Text>
                                        </TouchableOpacity>
                                    </Row>
                                </Col>
                            </Row> :
                            <Row size={1.25} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                <TouchableOpacity onPress={() => this.setState({inputMode: true})}
                                                  style={[styles.tabButton, styles.confirmBtn,
                                                      {height: scale(60), backgroundColor: 'transparent',}]}>
                                    <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.changePrinterAddress"]}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.openPort}
                                                  style={[styles.tabButton, styles.confirmBtn,
                                                      {height: scale(60)}]}>
                                    <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.connect"]}</Text>
                                </TouchableOpacity>
                            </Row>
                        }
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        );
    }
}
