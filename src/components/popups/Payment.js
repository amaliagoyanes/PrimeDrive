import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    View, FlatList
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {fetchData, hexAverage} from '../../api';
import {types} from '../../constants.js';
import {NumericKeyboard, ModalCloseButton, ModalHeader, ButtonItem, toFixedLocale} from '../index';
import {scale, scaleText} from '../../scaling';
import * as Progress from 'react-native-progress';


export default class Payment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, input: '', card: 0, cash: 0, currency: 0, giftCard: 0, active: '',
            paymentMethods: [], payments: {}, paymentsArr: [], paymentMethodsObj: {}, loaded: false
        };
        this.modalName = 'app.paymentUpper';

        this.cleanInput = this.cleanInput.bind(this);
        this.close = this.close.bind(this);
        this.closeTicket = this.closeTicket.bind(this);
        this.getBalance = this.getBalance.bind(this);
        this.open = this.open.bind(this);
        this.setActive = this.setActive.bind(this);
        this.numOnPress = this.numOnPress.bind(this);
        this.getPaymentMethods = this.getPaymentMethods.bind(this);
    }

    open() {
        this.setState({open: true}, () => this.getPaymentMethods())
    }

    getPaymentMethods() {
        fetchData('paymentMethods', {}).then(result => {
            let keys = Object.keys(result);
            let color = '#404048';
            let mid = Math.floor(keys.length / 2);

            let data = keys.map((field, i) => {
                if (i > mid) {
                    color = '#8d8d91';
                }
                result[field].color = color;
                return {...result[field], key: field, color: color}
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
            this.setState({paymentMethods: data, paymentMethodsObj: result, loaded: true, active: Object.keys(result)[0]});
        });
    }

    getBalance() {
        let balance = -parseFloat(this.props.total);
        this.state.paymentsArr.forEach(payment => {
            balance += payment.input * payment.rate;
        });
        // let balance = this.state.card + this.state.cash + this.state.currency + this.state.giftCard - parseFloat(this.props.total);
        return balance.toFixed(2)
    }

    cleanInput() {
        let input = this.state.input.slice(0, this.state.input.length - 1);
        let state = {input: input};
        state.payments = this.state.payments;
        if (input){
            state.payments[this.state.active].input = parseFloat(input.replace(',', '.'));
        } else {
            delete state.payments[this.state.active];
        }

        state.paymentsArr = Object.keys(state.payments).map(key => {
            return {...state.payments[key], key: key}
        });
        this.setState(state)
    }

    closeTicket() {
        if (this.getBalance() >= 0) {
            // let payments = ['card', 'cash', 'currency'].map(type => {
            //     return {type: type, total: this.state[type]}
            // });
            // payments = payments.filter(type => type.total > 0);
            this.props.onOk(this.state.paymentsArr);
            this.close();
        }
    }

    close() {
        this.setState({
            open: false, input: '', card: 0, cash: 0, currency: 0, giftCard: 0, active: '',
            paymentMethods: [], payments: {}, paymentsArr: [], paymentMethodsObj: {}, loaded: false
        })
    }

    numOnPress(text) {
        if (!this.state.loaded)
            return false;

        let input = this.state.input + text;
        if (this.state.input === '0' && text !== ',')
            input = text;
        let state = {input: input};
        state.payments = this.state.payments;

        if (state.payments[this.state.active] === undefined) {
            if (this.state.active) {
                state.payments[this.state.active] = this.state.paymentMethodsObj[this.state.active];
            } else {
                state.payments[this.state.active] = this.state.paymentMethodsObj[Object.keys(this.state.paymentMethodsObj)[0]];
            }
        }

        state.payments[this.state.active].input = parseFloat(input.replace(',', '.'));
        state.paymentsArr = Object.keys(state.payments).map(key => {
            return {...state.payments[key], key: key}
        });
        this.setState(state)
    }

    setActive(uid) {
        let input = '';
        if (this.state.payments[uid] !== undefined)
            input = this.state.payments[uid].input.toString();
        this.setState({active: uid, input: input})
    }

    render() {
        let isCurrency = false;
        if (this.state.active !== '' && this.state.active !== undefined)
            isCurrency = /currency/i.test(types[this.state.paymentMethodsObj[this.state.active].payment_type].name);
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={() => {
                    if (!!this.props.close)
                        this.close();
                }}>
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
                        paddingBottom: scale(40)
                    }}>
                        <ModalCloseButton close={this.close}/>
                        <ModalHeader modalName={this.modalName} intl={this.props.intl}/>
                        <Row size={18}>
                            <Col style={{
                                borderRightWidth: 0.2, borderColor: '#404048', marginBottom: scale(10),
                                marginTop: scale(30)
                            }}>
                                {this.state.loaded ?
                                <FlatList
                                    data={this.state.paymentMethods}
                                                                        extraData={this.state}
                                    renderItem={({item}) => <ButtonItem text={item.type} intl={this.props.intl}
                                                                        onPress={() => this.setActive(item.key)}
                                                                        style={[styles.modalButton, {
                                                                            height: scale(60),
                                                                            backgroundColor: item.key === this.state.active ? "#2dab61" : item.color,
                                                                            marginRight: scale(15)
                                                                        }]}
                                                                        textStyle={styles.modalButtonText}/>}
                                /> : <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                                        <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)}
                                                         indeterminate={true}/>
                                    </View> }
                            </Col>
                            <Col style={{
                                paddingLeft: scale(15),
                                paddingRight: scale(15),
                                borderRightWidth: 0.2,
                                borderColor: '#404048',
                                marginTop: scale(30),
                                marginBottom: scale(10)
                            }}>
                                <NumericKeyboard size={7} numOnPress={this.numOnPress}
                                                 intl={this.props.intl} input={this.state.input}
                                                 cleanInput={this.cleanInput}
                                                 showDelimiter
                                                 postfix={isCurrency ? "EUR" : "DKK"}/>

                                <Row size={1}>
                                    <ButtonItem text="app.okUpper" intl={this.props.intl}
                                                onPress={this.closeTicket} disabled={this.getBalance() < 0}
                                                style={[styles.modalButton, {
                                                    backgroundColor: this.getBalance() < 0 ? '#93D8B1' : '#3cb671',
                                                    marginRight: 0
                                                }]}
                                                textStyle={styles.modalButtonText}/>
                                </Row>
                                <Row size={1}>
                                    <ButtonItem text="app.cancelUpper" intl={this.props.intl}
                                                onPress={this.close}
                                                style={[styles.modalButton, {
                                                    backgroundColor: '#e84b3a',
                                                    marginRight: 0
                                                }]}
                                                textStyle={styles.modalButtonText}/>
                                </Row>
                            </Col>
                            <Col style={{
                                marginTop: scale(30),
                                paddingLeft: scale(15),
                                marginBottom: scale(10)
                            }}>
                                <Row size={6}>
                                <FlatList
                                    data={this.state.paymentsArr}
                                    renderItem={({item}) =>
                                        <ButtonItem text={item.type} intl={this.props.intl}
                                                    detailsText={`${toFixedLocale(item.input)} ${/currency/i.test(types[item.payment_type].name) ? "EUR" : "DKK"}`}
                                                    onPress={() => this.setActive(item.key)}
                                                    style={[styles.modalButton, styles.buttonSidedText, {
                                                        height: scale(60),
                                                        backgroundColor: item.color,
                                                        marginRight: 0
                                                    }]}
                                                    textStyle={[styles.modalButtonText, {
                                                        textAlign: 'left',
                                                        width: '50%'
                                                    }]}/>
                                    }
                                />
                                </Row>
                                <Row>
                                    <Col style={{borderBottomWidth: 0.3, borderColor: '#727278', paddingTop: scale(10)}}>
                                        <Row>
                                            <Col>
                                                <Text
                                                    style={[styles.text, {
                                                        fontSize: scaleText(16),
                                                        textAlign: 'right', color: '#313138'
                                                    }]}>
                                                    {this.props.intl !== undefined && this.props.intl.messages["app.balanceUpper"]}
                                                </Text>
                                            </Col>
                                        </Row>
                                        <Row
                                            style={{
                                                borderBottomWidth: 1, borderColor: '#727278',
                                                marginBottom: scale(5)
                                            }}>
                                            <Col>
                                                <Text
                                                    style={[styles.text, {
                                                        fontSize: scaleText(18),
                                                        fontFamily: 'Gotham-Bold', textAlign: 'right', color: '#313138'
                                                    }]}>
                                                    {toFixedLocale(this.getBalance())} DKK
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
