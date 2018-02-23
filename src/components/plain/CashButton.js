import React, {Component} from 'react';
import {
    TouchableOpacity,
    Text,
    View,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';

import {ButtonItem} from '../index'
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';

export default class CashButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: '', active: false
        };

        this.activate = this.activate.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.onPressBtn = this.onPressBtn.bind(this);
        this.getAmount = this.getAmount.bind(this);
        this.setAmount = this.setAmount.bind(this);
    }

    deactivate() {
        this.setState({active: false})
    }

    activate() {
        this.setState({active: true})
    }

    onPressBtn() {
        this.props.activate(this.props.refId, this.state.amount)
    }

    setAmount(amount) {
        this.setState({amount: amount})
    }

    getAmount() {
        return this.state.amount
    }

    render() {
        let bgColor = this.state.active ? {backgroundColor: '#404048'} : {};
        let amount = this.state.amount !== '' ? this.state.amount : undefined;
        return (
            <ButtonItem text={this.props.text} detailsText={amount} onPress={this.onPressBtn}
                        style={[styles.modalButton, styles.openDayButton, styles.buttonSidedText, bgColor,
                            {alignItems: 'center', justifyContent: 'center', height: scale(50),}]}
                        textStyle={[styles.modalButtonText, this.props.style, {
                            fontSize: scaleText(12), textAlign: 'left', width: this.state.amount !== '' ? '50%' : '100%'
                        }]}/>
        )
    }
}