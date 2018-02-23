import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    Button,
    View,
    TextInput,
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {AmountControl} from './TicketLine';
import {scale, scaleText} from '../../scaling';


export default class SelectRefundUnits extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false,
            ticketLine: {units: 0},
            input: ''
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    open(ticketLine){
        this.setState({open: true, ticketLine: ticketLine});
    }

    close(){
        this.setState({open: false})
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
                        top: Dimensions.get('screen').height * 0.375,
                        left: Dimensions.get('screen').width * 0.375,
                        width: Dimensions.get('screen').width * 0.25,
                        height: Dimensions.get('screen').height * 0.3,
                        backgroundColor: '#e3e5e6'
                    }}>
                        <Row size={0.5} style={{alignItems: 'flex-start', justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={this.close}
                                              style={[styles.timesIcon, {marginTop: 0, marginLeft: scale(18), backgroundColor: 'transparent'}]}>
                                <Icon size={scaleText(20)} name="close" color="#313138"/>
                            </TouchableOpacity>
                        </Row>
                        <Row style={{paddingLeft: scale(10), paddingRight: scale(10)}}>
                            <Col>
                                <Row>
                                    <Text style={[styles.text, {color: '#313138', textAlign: 'left'}]}>
                                        {this.props.intl.messages["app.lineContains"] + ' '}{this.state.ticketLine.units + ' '}
                                        {this.state.ticketLine.units > 1 ? this.props.intl.messages["app.units"] : this.props.intl.messages["app.unit"]}:
                                    </Text>
                                </Row>
                                <Row>
                                    <Text style={[styles.text, {color: '#313138', textAlign: 'left'}]}>
                                        {this.props.intl.messages["app.amountToRefund"]}
                                    </Text>
                                </Row>
                                <Row>
                                    <AmountControl ref={el => this._amountCtrl = el} maxAmount={this.state.ticketLine.units}/>
                                </Row>
                            </Col>

                        </Row>
                        <Row style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={this.close} style={[styles.tabButton, styles.confirmBtn,
                                {backgroundColor: 'transparent',}]}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                    {this.props.intl.messages["app.cancelUpper"]}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {this.close(); this.props.onOk(this.state.ticketLine, this._amountCtrl.getVal())}}
                                              style={[styles.tabButton, styles.confirmBtn]}>
                                <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                    {this.props.intl.messages["app.okUpper"]}
                                </Text>
                            </TouchableOpacity>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
