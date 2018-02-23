import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text, Button, View, TextInput,
    Alert, AsyncStorage
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling'


export default class TerminalStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, inputMode: false, displayCommands: true,
            address: props.address,
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    open() {
        this.setState({open: true, address: this.props.address})
    }

    close() {
        this.setState({open: false})
    }

    render() {
        if (!this.props.initialized) {
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
                        </TouchableOpacity>
                        <Row style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text>{this.props.intl.messages["app.initializing"]}</Text>
                        </Row>
                    </TouchableOpacity>
                </Modal>
            )
        }
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
                        <Row size={0.5} style={{alignItems: 'flex-start', justifyContent: 'flex-end'}}>
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
                                {this.props.intl !== undefined && this.props.intl.messages["app.terminalStatus"]}{' '}
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
                        <Row size={0.5} style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                {this.props.intl !== undefined && this.props.intl.messages["app.terminalAddress"]} {this.state.address}
                            </Text>
                        </Row>
                        <Row size={0.05}/>
                        {this.state.displayCommands && !this.state.inputMode &&
                        <Row size={0.5} style={{alignItems: 'flex-end', justifyContent: 'flex-end', backgroundColor: '#dddddd'}}>
                            <TouchableOpacity onPress={this.props.open}
                                              style={[styles.tabButton, styles.confirmBtn,
                                                  {height: scale(60), width: '34%', backgroundColor: 'transparent',}]}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>Open</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.props.endOfDay}
                                              style={[styles.tabButton, styles.confirmBtn,
                                                  {height: scale(60), width: '34%', backgroundColor: 'transparent',}]}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>Send ENDOFDAY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.props.close}
                                              style={[styles.tabButton, styles.confirmBtn,
                                                  {height: scale(60), width: '34%', backgroundColor: 'transparent',}]}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>Close</Text>
                            </TouchableOpacity>
                        </Row> }
                        {!this.state.displayCommands && !this.state.inputMode && <Row size={0.5}/> }

                        {this.state.inputMode ?
                            <Row size={1} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                <Col style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                    <Row size={0.5}>
                                        <TextInput onChange={(event) => this.setState({address: event.nativeEvent.text})}
                                                   style={[styles.text, styles.tableNameChangeInput]}
                                                   autoFocus={false}/>
                                    </Row>
                                    <Row size={0.5} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                        <TouchableOpacity onPress={() => this.setState({inputMode: false, address: this.props.address})}
                                                          style={[styles.tabButton, styles.confirmBtn,
                                                              {height: scale(60), backgroundColor: 'transparent',}]}>
                                            <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                                {this.props.intl !== undefined && this.props.intl.messages["app.cancelUpper"]}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.setState({inputMode: false}, this.props.setAddress(this.state.address))}
                                                          style={[styles.tabButton, styles.confirmBtn,
                                                              {height: scale(60)}]}>
                                            <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                                {this.props.intl !== undefined && this.props.intl.messages["app.okUpper"]}</Text>
                                        </TouchableOpacity>
                                    </Row>
                                </Col>
                            </Row> :
                            <Row size={0.5} style={{alignItems: 'flex-end', justifyContent: 'flex-end', backgroundColor: this.state.displayCommands ? '#ddd' :'#e3e5e6'}}>
                                <TouchableOpacity onPress={() => this.setState({inputMode: true})}
                                                  style={[styles.tabButton, styles.confirmBtn,
                                                      {height: scale(60), width: '34%', backgroundColor: '#e3e5e6',}]}>
                                    <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.changeTerminal"]}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.setState({displayCommands: !this.state.displayCommands})}
                                                  style={[styles.tabButton, styles.confirmBtn,
                                                      {height: scale(60), width: '34%', backgroundColor: '#e3e5e6',}]}>
                                    <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.terminalCommands"]}</Text>
                                </TouchableOpacity>
                                {this.props.connected ?
                                    <TouchableOpacity onPress={this.props.disconnect}
                                                      style={[styles.tabButton, styles.declineBtn,
                                                          {height: scale(60), width: '34%'}]}>
                                        <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                            {this.props.intl.messages["app.disconnect"]}</Text>
                                    </TouchableOpacity> :
                                    <TouchableOpacity onPress={this.props.connect}
                                                        style={[styles.tabButton, styles.confirmBtn,
                                                            {height: scale(60), width: '34%'}]}>
                                        <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                            {this.props.intl.messages["app.connect"]}</Text>
                                    </TouchableOpacity>
                                }
                            </Row>
                        }
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
