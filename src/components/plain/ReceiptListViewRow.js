import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    TextInput
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {toFixedLocale, toFixedLocaleDa} from './receipts/plainComponents'
import {Col, Row} from 'react-native-easy-grid';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';

export default class ReceiptListViewRow extends React.Component {
    render() {
        let ticketLine = this.props.data;
        let discount = '';
        let amount = '';
        let text = '';
        let splitted = (ticketLine.splitUnits>0) ? ticketLine.splitRatio : 1;

        if (ticketLine && ticketLine.discount !== undefined && ticketLine.discount.length)
            discount = toFixedLocaleDa(ticketLine.product_price * ticketLine.units * (parseFloat(ticketLine.discount.replace(',', '.')) * splitted / 100));

        if (ticketLine && ticketLine.campaign !== undefined && ticketLine.campaign.amount && ticketLine.campaign.type === 'discount') {
            amount = toFixedLocaleDa(ticketLine.product_price * ticketLine.units * (parseFloat(ticketLine.campaign.amount.replace(',', '.')) * splitted / 100));
            text = `${this.props.intl.messages["app.campaign"]} ${ticketLine.campaign.name} -${ticketLine.campaign.amount}%`;
        }
        if (ticketLine && ticketLine.campaign !== undefined && ticketLine.campaign.amount && ticketLine.campaign.type === 'price') {
            amount = toFixedLocaleDa(ticketLine.campaign.amount.replace(',', '.') * ticketLine.units * splitted);
            text = `${this.props.intl.messages["app.campaign"]} ${ticketLine.campaign.name}: ${ticketLine.campaign.amount} DKK`;
        }

        return (
            <Row style={{paddingTop: scale(1), paddingBottom: scale(5)}}><Col>
                <Row>
                    <Text style={[styles.text, styles.sectionReceiptProduct, {width: '50%'}]}>
                        {ticketLine.name}
                    </Text>
                    <Text style={[styles.text, styles.sectionReceiptProduct, {width: '25%', textAlign: 'right'}]}>
                        {ticketLine.units}{(ticketLine.splitRatio)? `x${Number(ticketLine.splitRatio).toFixed(2)}`:''} x
                    </Text>
                    <Text style={[styles.text, styles.sectionReceiptProductPrice, {width: '25%'}]}>
                        {toFixedLocaleDa(ticketLine.product_price * ticketLine.units * splitted)}
                    </Text>
                </Row>
                {ticketLine.campaign !== undefined && !!ticketLine.campaign.type.length && parseFloat(ticketLine.campaign.amount.replace(',', '.')) > 0 && 
                <Row>
                    <Text style={[styles.text, styles.sectionReceiptCampaign]}>{text}</Text>
                    <Text style={[styles.text, styles.sectionReceiptCampaignAmount]}>{ticketLine.campaign.type==='discount' && !(/-/.test(amount))?'-':''}{amount} DKK</Text>
                </Row>
                }
                {ticketLine.discount !== undefined && parseFloat(ticketLine.discount.replace(',', '.')) > 0 &&
                <Row>
                    <Text style={[styles.text, styles.sectionReceiptCampaign]}>
                        {this.props.intl !== undefined && this.props.intl.messages["app.discount"]}</Text>
                    <Text style={[styles.text, styles.sectionReceiptCampaignAmount]}>
                        {(/-/.test(discount))?'':'-'}{discount}</Text>
                </Row>
                }
            </Col></Row>
        );
    }
}