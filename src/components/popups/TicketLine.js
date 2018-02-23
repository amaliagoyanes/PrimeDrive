import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    View,
    TextInput,
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Row, Col} from 'react-native-easy-grid';
import styles from '../../style/styles';
import Modal from 'react-native-root-modal';
import {NumericKeyboard} from '../index.js';
import {scale, scaleText} from '../../scaling';
import {toFixedLocale} from '../plain/receipts/plainComponents';


export default class TicketLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '', active: 0, open: false, px: 0, py: 0, uid: null, name: ''
        };

        this.setActive = this.setActive.bind(this);
        this.confirm = this.confirm.bind(this);
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    setActive(i) {
        this.setState({active: i})
    }

    open(px, py, amount = 1, name = '', uid = null, note = '', product_price = 0, discount = '', campaign = '') {

        this.setState({open: true, px: px, py: py, name: name, amount: amount, uid: uid, note: note,
                       product_price: product_price, discount: discount, campaign: campaign})
    }

    close() {
        this.setState({open: false})
    }

    confirm() {
        let values = this.controls.getVal();
        if (this.props.onOk !== undefined) {
            this.props.onOk(this.amountCtrl.getVal(), this.state.uid, undefined, values.note, values.discount);
        }
        this.close();
    }

    render() {
        let left = this.props.arrow === 'left' ?
            this.state.px + 10 : this.state.px - Dimensions.get('screen').width / 6 - 10;
        let leftArrow = this.props.arrow === 'left' ?
            this.state.px : this.state.px - 15;
        let isDiscount = this.state.active === 0 && !this.props.readOnly;
        let isCampaign = this.state.campaign && this.state.campaign.amount;
        let campaign_amount = '';
        let campaign_text = '';
        if (isCampaign && this.state.campaign.type === 'discount') {
            campaign_amount = toFixedLocale(this.state.product_price * this.state.amount * (parseFloat(this.state.campaign.amount.replace(',', '.')) / 100));
            campaign_text = `${this.props.intl.messages["app.campaign"]} ${this.state.campaign.name} - ${this.state.campaign.amount}%`;
        }
        if (isCampaign && this.state.campaign.type === 'price') {
            campaign_amount = toFixedLocale(this.state.campaign.amount.replace(',', '.') * this.state.amount);
            campaign_text = `${this.props.intl.messages["app.campaign"]} ${this.state.campaign.name} - ${this.props.intl.messages["app.price"]} ${this.state.campaign.amount} DKK`;
            // style.textDecorationLine = 'line-through';
        }

        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <View style={{
                        position: 'absolute',
                        top: this.state.py + 5,
                        left: leftArrow
                    }}>
                        <View
                            style={this.props.arrow === 'left' ? [styles.triangle, styles.leftTriangle] : styles.triangle}/>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: this.state.py - 20,
                        left: left,
                        width: Dimensions.get('screen').width / 6,
                        height: isDiscount ? 300 : 155,
                        backgroundColor: '#404048'
                    }}>
                        <Row size={!!campaign_amount ? 1 : 2}
                            style={{alignItems: 'center', justifyContent: 'center', padding: scale(5)}}>
                            <Text style={styles.text}>{this.state.name.toUpperCase()}</Text>
                        </Row>
                        {!!campaign_amount &&
                        <Row style={{alignItems: 'center', justifyContent: 'center', marginLeft: scale(5), marginRight: scale(5)}}>
                            <Text style={[styles.text, styles.sectionDiscount]}>{campaign_text}</Text>
                            <Text style={[styles.text, styles.sectionDiscountPrice]}>{this.state.campaign.type==='discount'?'-':''}{campaign_amount} DKK</Text>
                        </Row>
                        }

                        <AmountControl ref={elt => this.amountCtrl = elt} amount={this.state.amount} />
                        <Row style={{backgroundColor: '#6f7076', marginTop: 1}}>
                            <TouchableOpacity
                                style={this.state.active === 0 ? [styles.tabButton, styles.activeColor] : [styles.tabButton]}
                                onPress={() => this.setState({active: 0})}>
                                <Text style={[styles.text, {fontSize: scaleText(9)}]}>
                                    {this.props.intl.messages["app.discountUpper"]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={this.state.active === 1 ? [styles.tabButton, styles.activeColor] : [styles.tabButton]}
                                onPress={() => this.setState({active: 1})}>
                                <Text style={[styles.text, {fontSize: scaleText(9)}]}>
                                    {this.props.intl.messages["app.noteUpper"]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tabButton, {backgroundColor: '#2eab61'}]}
                                              onPress={this.confirm}>
                                <Text style={[styles.text, {fontSize: scaleText(9)}]}>
                                    {this.props.intl.messages["app.okUpper"]}
                                </Text>
                            </TouchableOpacity>
                        </Row>
                        <TicketLineControls active={this.state.active} isDiscount={isDiscount} intl={this.props.intl}
                                            discount={this.state.discount} note={this.state.note} alert={this.props.alert}
                                            ref={elt => this.controls = elt} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}

export class TicketLineControls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: props.discount || '', text: props.note || ''
        };

        this.numOnPress = this.numOnPress.bind(this);
        this.cleanInput = this.cleanInput.bind(this);
    }

    numOnPress(text) {
        let newVal = this.state.input + text,
            max = 100;
        console.log('this.props.alert ', this.props);
        if (parseFloat(newVal) > max)
            this.props.alert(`${this.props.intl.messages["app.notGreaterThan"]} ${max}`);
        else
            this.setState({input: newVal})
    }

    cleanInput() {
        this.setState({input: ''});
    }

    getVal() {
        return {note: this.state.text, discount: this.state.input};
    }

    render() {
        return (
            <Row size={this.props.isDiscount ? 8 : 2} style={{backgroundColor: '#6f7076', padding: 0}}>
                {this.props.active !== 0 ?
                    <View style={[styles.tabInfo, {alignItems: 'center'}]}>
                        <TextInput value={this.state.text}
                                   style={[styles.text, {fontSize: scaleText(11), width: '100%', height: '100%'}]}
                                   multiline={true}
                                   onChangeText={(text) => this.setState({text})}/>
                    </View> :
                    this.props.readOnly ?
                        <View style={[styles.tabInfo, {alignItems: 'flex-end', padding: 10}]}>
                            <Text style={[styles.text, {fontSize: scaleText(13)}]}>25%</Text>
                        </View> :
                        <Col>
                            <Row size={5}>
                                <NumericKeyboard size={6} numOnPress={this.numOnPress} intl={this.props.intl}
                                                 input={this.state.input} inputBackgroundColor='#6f7076'
                                                 cleanInput={this.cleanInput} smallBlock
                                                 showDelimiter={true} postfix={'%'}/>
                            </Row>
                        </Col>
                }
            </Row>
        )
    }
}

export class AmountControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: props.amount || 1,
            maxAmount: props.maxAmount

        };

        this.getVal = this.getVal.bind(this);
        this.onPlusPress = this.onPlusPress.bind(this);
    }

    getVal() {
        return this.state.amount;
    }

    onPlusPress() {
        if (this.state.maxAmount) {
            if (this.state.maxAmount > this.state.amount)
                this.setState({amount: this.state.amount + 1});
        }
        else
            this.setState({amount: this.state.amount + 1})
    }

    render() {
        return (
            <Row style={{alignItems: 'center'}}>
                <TouchableOpacity name="minus" style={[styles.tabButton]}
                                  onPress={() => this.state.amount !== 1 ? this.setState({amount: this.state.amount - 1}) : ''}>
                    <Text style={[styles.text]}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabButton]}>
                    <Text style={styles.text}>{this.state.amount}</Text>
                </TouchableOpacity>
                <TouchableOpacity name="plus" style={[styles.tabButton]}
                                  onPress={this.onPlusPress}>
                    <Text style={[styles.text]}>+</Text>
                </TouchableOpacity>
            </Row>
        )
    }
}