import moment from 'moment';
import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    TextInput
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Col, Row} from 'react-native-easy-grid';
import styles from '../../../style/styles';
import {scale, scaleText} from '../../../scaling';

export const SectionHeader = (props) => (
    <View style={styles.sectionHeader}>
        <Text style={[styles.text, styles.sectionProduct]}>
            {props.intl !== undefined && props.intl.messages["app.product"].toUpperCase()}</Text>
        <Text style={[styles.text, styles.sectionUnits]}>
            {props.intl !== undefined && props.intl.messages["app.units"].toUpperCase()}</Text>
        <Text style={[styles.text, styles.sectionTotalPrice]}>
            {props.intl !== undefined && props.intl.messages["app.totalPrice"].toUpperCase()}</Text>
    </View>
);

export const ReceiptTotals = (props) => (
    <View style={[styles.receiptTotals, props.style]}>
        {props.discount !== undefined && props.discount > 0 &&
        <View style={[styles.receiptTotalsRow, {marginBottom: props.small ? scale(5) : scale(10)}]}>
            <Text
                style={[styles.text, styles.receiptTotalsLeftCol,
                    {fontSize: props.small ? scaleText(10) : scaleText(12)}]}>
                {props.intl !== undefined && props.intl.messages["app.discount"].toUpperCase()}
            </Text>
            <Text style={[styles.text, styles.receiptTotalsRightCol,
                {fontSize: props.small ? scaleText(10) : scaleText(12)}]}>
                -{props.discount}% / -{toLocale((props.total * props.discount / 100).toFixed(2)).replace('.', ',')}
                DKK</Text>
        </View>
        }
        <View style={styles.receiptTotalsRow}>
            <Text style={[styles.text, styles.receiptTotalsLeftCol, {
                fontFamily: 'Gotham-Bold',
                fontSize: props.small ? scaleText(12) : scaleText(16)
            }]}>
                {props.intl !== undefined && props.intl.messages["app.total"].toUpperCase()}</Text>
            <Text style={[styles.text, styles.receiptTotalsRightCol, {
                fontFamily: 'Gotham-Bold',
                fontSize: props.small ? scaleText(12) : scaleText(16)
            }]}>{props.discount !== undefined ? toFixedLocaleDa(props.total * (1 - props.discount / 100)) :
                toFixedLocaleDa(props.total)
            } DKK</Text>
        </View>
    </View>
);

export const ReceiptListViewFooter = (props) => (
    <View>
        {/*<Row style={{marginTop: scale(5), paddingTop: scale(5), borderTopWidth: 1, borderColor: '#afafaf'}}>*/}
        {/*<View style={{borderBottomWidth: 1, borderColor: '#afafaf'}}>*/}
        {/*<View style={[styles.receiptTotalsRow, {borderBottomWidth: 1, borderColor: '#afafaf'}]}>*/}
        {/*<Text*/}
        {/*style={[styles.text, {fontSize: scaleText(8), color: '#afafaf', width: '50%'}]}>At betale</Text>*/}
        {/*<Text*/}
        {/*style={[styles.text, {fontSize: scaleText(8), color: '#afafaf', width: '50%', textAlign: 'right'}]}>{props.total}</Text>*/}
        {/*</View>*/}
        {/*</View>*/}
        {/*</Row>*/}
        <Row style={{marginTop: scale(5), paddingTop: scale(5), borderTopWidth: 1, borderColor: '#afafaf'}}/>
        {Object.keys(props.discount).length > 0 && props.discount.value !== '-0' && props.discount.value !== 0 &&
        <Row>
            <View style={styles.receiptTotalsRow}>
                <View style={[styles.receiptTotalsRow]}>
                    <View style={[{width: '70%'}]}>
                        <Text style={[styles.text, {
                            fontSize: scaleText(12), color: '#6a6a6a'}]}>{props.intl !== undefined && props.intl.messages["app.discount"].toUpperCase()} {props.discount.name}</Text>
                    </View>
                    <Text
                        style={[styles.text, {
                            fontSize: scaleText(12), color: '#6a6a6a', width: '30%', textAlign: 'right'
                        }]}>{toFixedLocale(props.discount.value)}</Text>
                </View>
            </View>
        </Row>
        }
        {props.total !== '' &&
        <Row>
            <View style={styles.receiptTotalsRow}>
                <View style={[styles.receiptTotalsRow]}>
                    <Text
                        style={[styles.text, {fontSize: scaleText(14), color: '#6a6a6a', width: '50%'}]}>
                        {props.intl !== undefined && props.intl.messages["app.paid"].toUpperCase()}</Text>
                    <Text
                        style={[styles.text, {
                            fontSize: scaleText(14),
                            color: '#6a6a6a',
                            width: '50%',
                            textAlign: 'right'
                        }]}>
                        {toFixedLocaleDa(props.total)}</Text>
                </View>
            </View>
        </Row>
        }
        {props.card !== undefined &&
        <Row>
            <View style={styles.receiptTotalsRow}>
                <View style={[styles.receiptTotalsRow]}>
                    <Text
                        style={[styles.text, {
                            fontSize: scaleText(9),
                            color: '#6a6a6a',
                            width: '100%'
                        }]}>{props.card}</Text>
                </View>
            </View>
        </Row>
        }
    </View>
);

export function toLocale(num) {
    return num.toLocaleString('da-DK', {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

export function toFixedLocale(num) {
    return parseFloat(num).toFixed(2).toString().replace('.', ',')
}

export function toFixedLocaleDa(num) {
    let parts = parseFloat(num).toFixed(2).toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
}

export function guid() {
    return guid4() + '-' + guid4() + '-' + guid4() + '-' + guid4();
}

export function guid4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

export const ReceiptItem = (props) => (props.data !== undefined &&

    <Col onPress={props.onPress}>
        <Row size={1} style={styles.closedReceiptHeader}>
            <Col>
                <Text style={{color: 'white', fontSize: scaleText(10)}}>
                    {moment.unix(props.data.timestamp).format('DD.MM.YYYY')}
                </Text>
            </Col>
            <Col>
                <Text style={{
                    textAlign: 'right',
                    color: 'white',
                    fontSize: scaleText(10)
                }}>KL: {moment.unix(props.data.timestamp).format('HH:mm:ss')}</Text>
            </Col>
        </Row>
        <Row size={3} style={styles.closedReceiptBody}>
            <Col>
                {props.data.table !== undefined && props.data.table.length > 0 &&
                <Row size={3}>
                    <Text style={{color: 'white', fontSize: scaleText(16), fontFamily: 'Gotham-Bold'}}>{props.data.number}</Text>
                </Row>}
                <Row size={4}>
                    <Text style={{color: 'white', fontSize: scaleText(22), fontFamily: 'Gotham-Bold'}}>{props.data.table}</Text>
                </Row>
                {props.data.customer_name !== undefined && props.data.customer_name.length > 0 &&
                <Row size={2.5}>
                    <Text style={{
                        color: 'white',
                        fontSize: scaleText(20),
                        fontFamily: 'Gotham-Bold'
                    }}>{props.data.customer_name ? props.data.customer_name.toUpperCase() : ''}</Text>
                </Row>
                }
            </Col>
        </Row>
        <Row size={3}>
            <ReceiptTotals total={props.data.total} discount={props.data.discount} small={true}
                           style={{marginRight: 15, marginBottom: scale(5)}} intl={props.intl}/>
        </Row>
    </Col>
);