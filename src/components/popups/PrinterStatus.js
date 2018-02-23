import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text, Button, View, TextInput,
    Alert, AsyncStorage
} from 'react-native';

import StarIo from 'react-native-star-io';
// import EpsonTmPrinter from 'react-native-epson-tm-printer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling'

export default class PrinterStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, inputMode: false, isUSB: props.isUSB,
            port: '', address: ''
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.openPort = this.openPort.bind(this);
        this.toggleUSB = this.toggleUSB.bind(this);
        this.searchPrinter = this.searchPrinter.bind(this);
    }

    open() {
        this.setState({open: true})
    }

    close() {
        this.setState({open: false, port: null, address: null, inputMode: false})
    }

    toggleUSB() {
        this.setState({isUSB: !this.state.isUSB}, () => {
            AsyncStorage.setItem('@PrimeDrive:isUSBPrinter', this.state.isUSB.toString());
            this.props.setPrinterType(this.state.isUSB);
        })
    }

    componentDidUpdate(props, state) {
        if (props.isUSB !== this.props.isUSB && this.props.isUSB !== undefined) {
            this.setState({isUSB: this.props.isUSB});
        }
    }

    openPort() {
        if (this.state.isUSB && this.state.address !== null) {
            AsyncStorage.setItem('@PrimeDrive:printerAddress', this.state.address);
            this.close();
            // EpsonTmPrinter.connect(this.state.address).then(resp => {
            //     console.log(resp)
            //     this.close();
            //     this.props.setPrinterAddress(this.state.address);
            // }).catch(err => {
            //     console.log(err);
            //     Alert.alert('Error', "Printer with such address wasn't found.");
            // })
        } else if (this.state.port !== null && this.state.port !== '') {
            StarIo.openPort(this.state.port).then(resp => {
                this.close();
                this.props.setPort(this.state.port);
            }).catch(err => {
                this.props.alert("Printer with such name wasn't found.");
            })
        }
    }

    searchPrinter() {
        StarIo.searchAndOpenPort()
            .then(resp => {
                if (resp.length > 0) {
                    let printer = resp[0];
                    this.props.setPort(printer.port);
                    AsyncStorage.setItem('@PrimeDrive:printerPort', printer.port);
                } else {
                    this.props.alert('No printers found.');
                    this.close();
                }
            })
            .catch(err => {
            });
    }

    render() {
        if (this.state.isUSB)
            return (
                <Modal
                    onRequestClose={this.close}
                    visible={this.state.open}
                    style={styles.modal}
                >
                    <TouchableOpacity style={styles.overlay} onPress={this.close}>
                        <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                            position: 'absolute',
                            top: Dimensions.get('screen').height * 0.325,
                            left: Dimensions.get('screen').width * 0.25,
                            width: Dimensions.get('screen').width * 0.5,
                            height: Dimensions.get('screen').height * 0.35,
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
                            <Row size={0.75}
                                 style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                    {this.props.intl !== undefined && this.props.intl.messages["app.currentPrinterAddress"]} {this.props.address}
                                </Text>
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
                                                                  {
                                                                      height: scale(60),
                                                                      backgroundColor: 'transparent',
                                                                  }]}>
                                                <Text
                                                    style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
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
                                                          {
                                                              height: scale(60),
                                                              width: '33.3%',
                                                              backgroundColor: 'transparent',
                                                          }]}>
                                        <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                            {this.props.intl !== undefined && this.props.intl.messages["app.changePrinterAddress"]}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={this.toggleUSB}
                                                      style={[styles.tabButton, styles.confirmBtn,
                                                          {
                                                              height: scale(60),
                                                              width: '33.3%',
                                                              backgroundColor: 'transparent',
                                                          }]}>
                                        <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                            {this.props.intl !== undefined && this.props.intl.messages["app.useStarIOPrinter"]}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={this.openPort}
                                                      style={[styles.tabButton, styles.confirmBtn,
                                                          {height: scale(60), width: '33.3%'}]}>
                                        <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                            {this.props.intl !== undefined && this.props.intl.messages["app.connect"]}</Text>
                                    </TouchableOpacity>
                                </Row>
                            }
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            );
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: Dimensions.get('screen').height * 0.325,
                        left: Dimensions.get('screen').width * 0.25,
                        width: Dimensions.get('screen').width * 0.5,
                        height: Dimensions.get('screen').height * 0.35,
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
                        <Row size={0.75}
                             style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                {this.props.intl !== undefined && this.props.intl.messages["app.currentPortName"]} {this.props.port}
                            </Text>
                        </Row>
                        {this.state.inputMode ?
                            <Row size={1.25} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                <Col style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                    <Row size={0.75}>
                                        <TextInput onChange={(event) => this.setState({port: event.nativeEvent.text})}
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
                                                      {
                                                          height: scale(60),
                                                          width: '50%',
                                                          backgroundColor: 'transparent',
                                                      }]}>
                                    <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.changePortName"]}</Text>
                                </TouchableOpacity>
                                {/*<TouchableOpacity onPress={this.toggleUSB}*/}
                                                  {/*style={[styles.tabButton, styles.confirmBtn,*/}
                                                      {/*{*/}
                                                          {/*height: scale(60),*/}
                                                          {/*width: '33.3%',*/}
                                                          {/*backgroundColor: 'transparent',*/}
                                                      {/*}]}>*/}
                                    {/*<Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>*/}
                                        {/*{this.props.intl !== undefined && this.props.intl.messages["app.useEpsonPrinter"]}</Text>*/}
                                {/*</TouchableOpacity>*/}
                                <TouchableOpacity onPress={this.searchPrinter}
                                                  style={[styles.tabButton, styles.confirmBtn,
                                                      {height: scale(60), width: '50%'}]}>
                                    <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.searchPrinter"]}</Text>
                                </TouchableOpacity>
                            </Row>
                        }
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
