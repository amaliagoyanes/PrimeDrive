import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    TextInput
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import Swipeout from 'react-native-swipeout';
import {Col, Row} from 'react-native-easy-grid';
import {toFixedLocale, toFixedLocaleDa} from './receipts/plainComponents';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';

export default class ListViewRow extends React.Component {
    onPress() {
        this._line.measure((fx, fy, width, height, px, py) => {
            this.props.onPress(px, py, width, height);
        });
    }

    render() {
        let data = this.props;
        let disabled = this.props.disabled || false;
        let swipeoutBtns = !disabled ? [{backgroundColor: '#e84a3a', text: this.props.intl.messages["app.deleteUpper"],
            onPress: () => this.props.onDelete(data.uid, data.isDiscount)}] : null;
        let discount = '';
        let amount = '';
        let text = '';
        let style = {};
        let isCampaign = data && data.campaign !== undefined && data.campaign.amount;
        let splitted = (data.splitUnits>0) ? data.splitRatio : 1;

        if (data && data.discount !== undefined && data.discount.length && data.isDiscount)
            discount = toFixedLocaleDa(data.price * data.units * (parseFloat(data.discount.replace(',', '.')) * splitted / 100));
        if (isCampaign && data.campaign.type === 'discount') {
            amount = toFixedLocaleDa(data.product_price * data.units * (parseFloat(data.campaign.amount.replace(',', '.')) * splitted / 100));
            text = `${this.props.intl.messages["app.campaign"]} ${data.campaign.name} - ${this.props.intl.messages["app.discount"]} ${data.campaign.amount}%`;
        }
        if (isCampaign && data.campaign.type === 'price') {
            amount = toFixedLocaleDa(data.campaign.amount.replace(',', '.') * data.units * splitted);
            text = `${this.props.intl.messages["app.campaign"]} ${data.campaign.name} - ${this.props.intl.messages["app.price"]} ${data.campaign.amount} DKK`;
            style.textDecorationLine = 'line-through';
        }
        return (
            <Swipeout disabled={disabled} right={swipeoutBtns} backgroundColor="#53535a" autoClose={true}>
                <TouchableOpacity style={styles.listViewRow}
                                  ref={elt => this._line = elt} onPress={() => this.onPress()}>
                    <Col style={{alignItems: 'center', justifyContent: 'center'}}>
                        {data.isDiscount !== undefined ?
                            <Row style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={[styles.text, styles.sectionProduct]}>{data.name.toUpperCase()}</Text>
                                <Text style={[styles.text, styles.sectionUnits]} />
                                <Text style={[styles.text, styles.sectionTotalPrice]}>
                                    -{discount} DKK</Text>
                            </Row> :
                            <Row style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={[styles.text, styles.sectionProduct]}>{data.name.toUpperCase()}</Text>
                                <Text style={[styles.text, styles.sectionUnits]}>
                                    {data.units}{(data.splitRatio) ? `x${Number(data.splitRatio).toFixed(2)}` : ''} x
                                </Text>
                                <Text style={[styles.text, styles.sectionTotalPrice, {...style}]}>
                                    {toFixedLocaleDa(data.product_price * data.units * splitted)} DKK</Text>
                            </Row>
                        }
                        {!data.isDiscount && data.campaign !== undefined && !!data.campaign.type && parseFloat(data.campaign.amount.replace(',', '.')) > 0 &&
                        <Row style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.text, styles.sectionDiscount]}>{text}</Text>
                            <Text style={[styles.text, styles.sectionDiscountPrice]}>{data.campaign.type==='discount'?'-':''}{amount} DKK</Text>
                        </Row>
                        }
                        {data.discount !== undefined && parseFloat(data.discount.replace(',', '.')) > 0 && !!data.isDiscount &&
                        <Row style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.text, styles.sectionDiscount]}>
                                {this.props.intl.messages["app.discount"]}</Text>
                            <Text style={[styles.text, styles.sectionDiscountPrice]} />
                        </Row>
                        }
                    </Col>
                </TouchableOpacity>
            </Swipeout>
        );
    }
}