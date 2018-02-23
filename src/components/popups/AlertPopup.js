import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    Button,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling'


export default class AlertPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            text: null
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    open(text) {
        this.setState({open: true, text: text !== undefined ? text : null})
    }

    close() {
        this.setState({open: false, text: null})
    }

    render() {
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={() => {
                    if (!this.props.explicitClosing)
                        this.close();
                }}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: Dimensions.get('screen').height * 0.375,
                        left: Dimensions.get('screen').width * 0.25,
                        width: Dimensions.get('screen').width * 0.5,
                        height: Dimensions.get('screen').height * 0.25,
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
                        <Row size={2}
                             style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                    {this.state.text}</Text>
                        </Row>
                        <Row size={1.25} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={this.close} style={[styles.tabButton, styles.confirmBtn, {width: '20%'}]}>
                                <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                    {this.props.intl !== undefined && this.props.intl.messages["app.okUpper"]}</Text>
                            </TouchableOpacity>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
