import moment from 'moment';
import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    Button,
    View,
    Image,
    ListView,
    Alert,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import firestack from '../../fbconfig.js';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {fetchTicketLines, printReceipt, testReceipt} from '../../api';
import {IconButton, ReceiptListViewRow, ReceiptListViewFooter, ActionConfirm, guid, SelectRefundUnits} from '../index'
import {scale, scaleText} from '../../scaling';


export default class ReceiptModal extends Component {
    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
        this.ds = ds;
        this.state = {
            visible: false, timestamp: 0,
            departmentName: '', address: '', city: '', taxID: '',
            x: 0, y: 0,
            data: ds.cloneWithRows([]), lines: [], ticket: {},
            total: '', card: '', discount: {},
            arrowStyle: {},
            returnButtonPressed: false, refunded: false
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.refundOnConfirm = this.refundOnConfirm.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
        this.ticketLineUpdated = this.ticketLineUpdated.bind(this);
        this.openUnitsPopup = this.openUnitsPopup.bind(this);
        this.printReceipt = this.printReceipt.bind(this);
        this.refundTicket = this.refundTicket.bind(this);
    }

    open(props) {
        this.setState({
            visible: true,
            x: props.x,
            y: props.y,
            arrowStyle: props.arrowStyle,
            returnButtonPressed: false,
            ticket: props.ticket,
            refunded: props.ticket.refunded || false
        }, () => this.updateDetails(props.ticket));
    }

    printReceipt() {
        let receipt = {
            total: this.state.total,
            lines: this.state.lines,
            date: moment.unix(this.state.timestamp).format('DD.MM.YYYY'),
            time: moment.unix(this.state.timestamp).format('HH:mm:ss'),
            number: this.state.number,
            department: this.state.departmentName,
            address: this.state.address,
            city: this.state.city,
            taxID: this.state.taxID
        };

        if (this.state.images) {
            try {
                receipt.logo = this.state.images[Object.keys(this.state.images)[0]].downloadURL;
            } catch (err) {
            }
        }

        if (this.state.discount.value && this.state.discount.value > 0)
            receipt.discount = this.state.discount;
        if (!!this.props.printerType && this.props.printerType !== 'mpop')
            this.props.print(receipt, false);
        else
            printReceipt(receipt, false, this.props.port, undefined, (text) => this.props.alert(text));
    }

    createRefundPayment(ticketLine, units) {
        firestack.database.ref(`/payments/`).orderByChild('ticket_id').equalTo(ticketLine.ticket_id).limitToFirst(1)
            .once('value').then((snapshot) => {
            snapshot = snapshot.val();
            let prop;
            for (prop in snapshot) break;

            let originalPayment = snapshot[prop],
                timestamp = moment().unix(),
                payment = {
                    cash_shift_id: originalPayment.cash_shift_id,
                    customer_uid: originalPayment.customer_uid,
                    customer_timestamp: `${originalPayment.customer_uid}~${timestamp}`,
                    dealer_uid: originalPayment.dealer_uid,
                    dealer_timestamp: `${originalPayment.dealer_uid}~${timestamp}`,
                    ticket_id: ticketLine.ticket_id,
                    timestamp: timestamp,
                    payment_type: originalPayment.payment_type,
                    type: originalPayment.type,
                    value: -(ticketLine.product_price * units),
                };

            let payment_uid = guid();
            firestack.database.ref(`/payments/${payment_uid}`).set(payment)
                .catch(err => console.log(err));
        }).catch()

    }

    refundTicket() {
        let ticket = this.state.ticket,
        newTicketGuid = guid(),
        timestamp = moment().unix(),
        newTicket = {
            cash_shift_id: ticket.cash_shift_id,
            customerId: ticket.customerId,
            customer_name: ticket.customer_name,
            customer_timestamp: `${ticket.customer_uid}~${timestamp}`,
            customer_uid: ticket.customer_uid,
            dealer_timestamp: `${ticket.dealer_uid}~${timestamp}`,
            dealer_uid: ticket.dealer_uid,
            total: -ticket.total,
            discount: ticket.discount,
            number: ticket.number,
            status: ticket.status,
            table: ticket.table,
            timestamp: timestamp,
            user_id: ticket.user_id,
            refunded: true
        };
        firestack.database.ref(`/payments/`).orderByChild('ticket_id').equalTo(ticket.uid).limitToFirst(1)
            .once('value').then((snapshot) => {
            snapshot = snapshot.val();
            let prop;
            for (prop in snapshot) break;

            let originalPayment = snapshot[prop],
                payment = {
                    cash_shift_id: originalPayment.cash_shift_id,
                    customer_uid: originalPayment.customer_uid,
                    customer_timestamp: `${originalPayment.customer_uid}~${timestamp}`,
                    dealer_uid: originalPayment.dealer_uid,
                    dealer_timestamp: `${originalPayment.dealer_uid}~${timestamp}`,
                    ticket_id: newTicketGuid,
                    timestamp: timestamp,
                    payment_type: originalPayment.payment_type,
                    type: originalPayment.type,
                    value: -originalPayment.value,
                };

            let payment_uid = guid();
            firestack.database.ref(`/payments/${payment_uid}`).set(payment)
                .catch(err => console.log(err));
        }).catch()
        firestack.database.ref(`/tickets/${newTicketGuid}`).set(newTicket).catch(err => console.log(err));
        if (ticket.ticket_lines) {
            Object.keys(ticket.ticket_lines).forEach(key => {
                let ticketLine = ticket.ticket_lines[key],
                newTicketLineGuid = guid(),
                newTicketLine = {
                    cash_shift_id: ticketLine.cash_shift_id,
                    customer_timestamp: `${ticketLine.customer_uid}~${timestamp}`,
                    customer_uid: ticketLine.customer_uid,
                    dealer_timestamp: `${ticketLine.dealer_uid}~${timestamp}`,
                    dealer_uid: ticketLine.dealer_uid,
                    name: ticketLine.name,
                    product_id: ticketLine.product_id,
                    product_price: -ticketLine.product_price,
                    campaign: ticketLine.campaign,
                    discount: ticketLine.discount,
                    table: ticketLine.table,
                    tax_id: ticketLine.tax_id,
                    ticket_id: newTicketGuid,
                    timestamp: timestamp,
                    units: ticketLine.units
                };
                firestack.database.ref(`/ticketLines/${newTicketLineGuid}`).set(newTicketLine).then((snapshot) => {
                    this.setState({refunded: true});
                }).catch(err => console.log(err));
            });
        }
        firestack.database.ref(`/tickets/${ticket.uid}`).update({refunded: true}).then((response) => {
            this.props.getReceipts();
            this.close();
        }).catch(err => console.log(err));
    }

    updateTicketTotal(ticket_id, price, units) {
        firestack.database.ref(`/tickets/${ticket_id}`).once('value').then((snapshot) => {
            snapshot = snapshot.val();
            let total = snapshot.total - (price * units);
            firestack.database.ref(`/tickets/${ticket_id}`).update({total: total})
                .then(response => this.props.getReceipts()).catch();
        })
    }

    updateDetails(ticket) {
        let state = {};
        let lines = [];
        if (ticket.ticket_lines) {
            lines = Object.keys(ticket.ticket_lines).map(key => {
                return {...ticket.ticket_lines[key], uid: key}
            });
        }
        state.lines = lines;
        state.data = this.ds.cloneWithRows(lines);
        state.discount = {name: `-${ticket.discount}%`, value: `-${ticket.discount / 100 * ticket.total}`};
        state.total = ticket.total * (1 - ticket.discount / 100);
        state.timestamp = ticket.timestamp;
        state.number = ticket.number;
        firestack.database.ref(`/clientDepartments/${this.props.departmentId}`).once('value').then(snapshot => {
            let department = snapshot.val();
            if (department !== null) {
                state.address = department.address || '';
                state.city = department.city || '';
                state.taxID = 'NR. ' + department.taxID || '';
                state.departmentName = department.name || '';
                state.images = department.images;
            }
            this.setState(state);
        });
        // fetchTicketLines(ticket.uid).then(lines => {
        //     if (lines) {
        //         lines = Object.keys(lines).map(key => {
        //             return {...lines[key], uid: key}
        //         });
        //         state.lines = lines;
        //         state.data = this.ds.cloneWithRows(lines);
        //         firestack.database.ref(`/tickets/${ticket.uid}`).once('value').then((snapshot) => {
        //             const val = snapshot.val();
        //             state.discount = {name: `-${val.discount}%`, value: `-${val.discount / 100 * val.total}`};
        //             state.total = val.total * (1 - val.discount / 100);
        //             state.timestamp = val.timestamp;
        //             state.number = val.number;
        //             // state.card = '457150*****8975';
        //             firestack.database.ref(`/clientDepartments/${this.props.departmentId}`).once('value').then(snapshot => {
        //                 let department = snapshot.val();
        //                 if (department !== null) {
        //                     state.address = department.address || '';
        //                     state.city = department.city || '';
        //                     state.taxID = 'NR. ' + department.taxID || '';
        //                     state.departmentName = department.name || '';
        //                     state.images = department.images;
        //                 }
        //                 this.setState(state);
        //             });
        //         }).catch();
        //     }
        // })
    }

    ticketLineUpdated(ticketLine, units) {
        this.updateDetails(ticketLine.ticket_id);
        this.createRefundPayment(ticketLine, units);
        this.updateTicketTotal(ticketLine.ticket_id, ticketLine.product_price, units);
    }

    refundOnConfirm(ticketLine, units) {
        if (units === ticketLine.units)
            firestack.database.ref(`/ticketLines/${ticketLine.uid}`).update({product_price: -ticketLine.product_price}).then((snapshot) => {
                this.ticketLineUpdated(ticketLine, units);
            });
        else if (units < ticketLine.units) {
            firestack.database.ref(`/ticketLines/${ticketLine.uid}`).update({units: ticketLine.units - units}).then((snapshot) => {
                let newTicketLineGuid = guid(),
                    newTicketLine = {
                        name: ticketLine.name,
                        product_id: ticketLine.product_id,
                        product_price: -ticketLine.product_price,
                        tax_id: ticketLine.tax_id,
                        ticket_id: ticketLine.ticket_id,
                        uid: newTicketLineGuid,
                        units: units
                    };
                firestack.database.ref(`/ticketLines/${newTicketLineGuid}`).set(newTicketLine).then((snapshot) => {
                    this.ticketLineUpdated(ticketLine, units);
                }).catch(err => console.log(err));
            });
        }
        this.setState({returnButtonPressed: false})
    }

    openUnitsPopup(ticketLine) {
        if (this.state.returnButtonPressed) {
            if (ticketLine.product_price > 0) this._selectRefundUnits.open(ticketLine);
            else
                this.props.alert(this.props.intl.messages['app.alreadyRefunded'])
        }
    }

    close() {
        this.setState({
            visible: false,
            x: 0, y: 0,
            data: this.ds.cloneWithRows([]), lines: [],
            total: '', card: '', discount: {},
            arrowStyle: {}, timestamp: 0,
            returnButtonPressed: false
        });
    }

    render() {
        let logo = '';
        if (this.state.images && Object.keys(this.state.images).length)
            logo = this.state.images[Object.keys(this.state.images)[0]].downloadURL;
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.visible}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <View style={{
                        position: 'absolute', transform: [{rotate: '45deg'}], backgroundColor: '#3f3f48',
                        left: this.state.arrowStyle.left, top: this.state.arrowStyle.top,
                        width: this.state.arrowStyle.width, height: this.state.arrowStyle.height
                    }}/>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: this.state.y,
                        left: this.state.x,
                        width: Dimensions.get('screen').width * 0.245,
                        height: Dimensions.get('screen').height * 0.83,
                        backgroundColor: '#383840'
                    }}>
                        {this.state.timestamp === 0 ?
                            <View
                                style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                <Text
                                    style={[styles.text, styles.sectionReceiptProduct, {textAlign: 'center'}]}>
                                    {this.props.intl.messages["app.loading"]}</Text>
                            </View>
                            :
                            <Col>
                                <Row size={8.5} style={styles.receiptModalBody}>
                                    <Col>
                                        <Row size={9} style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingBottom: 10
                                        }}>
                                            <Image
                                                style={{width: 91, height: 48}}
                                                source={{uri: logo}}
                                            />
                                        </Row>
                                        <Row size={3}>
                                            <Col style={{alignItems: 'center'}}>
                                                <Text
                                                    style={[styles.text, styles.sectionReceiptProduct, {textAlign: 'center'}]}>
                                                    {this.state.departmentName}</Text>
                                            </Col>
                                        </Row>
                                        <Row name="credentials" size={7} style={{
                                            paddingTop: 10,
                                            paddingBottom: 10,
                                            marginBottom: 5,
                                            borderBottomWidth: 1,
                                            borderColor: '#afafaf'
                                        }}>
                                            <Col>
                                                <Row><Text style={[styles.text, styles.receiptModalHeaderText]}>
                                                    {moment.unix(this.state.timestamp).format('DD.MM.YYYY')}</Text></Row>
                                                <Row><Text style={[styles.text, styles.receiptModalHeaderText]}>
                                                    {moment.unix(this.state.timestamp).format('HH:mm:ss')}</Text></Row>
                                                <Row><Text style={[styles.text, styles.receiptModalHeaderText]}>
                                                    {this.state.number}</Text></Row>
                                            </Col>
                                            <Col>
                                                <Row><Text
                                                    style={[styles.text, styles.receiptModalHeaderText]}>{this.state.address}</Text></Row>
                                                <Row><Text
                                                    style={[styles.text, styles.receiptModalHeaderText]}>{this.state.city}</Text></Row>
                                                <Row><Text
                                                    style={[styles.text, styles.receiptModalHeaderText]}>{this.state.taxID}</Text></Row>
                                            </Col>
                                        </Row>
                                        <Row size={3}>
                                            <Col>
                                                <Text style={[styles.text, styles.sectionReceiptProduct]}>
                                                    {this.props.intl.messages["app.description"]}</Text>
                                            </Col>
                                            <Col style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                                <Text style={[styles.text, styles.sectionReceiptProduct,
                                                    {textAlign: 'right'}]}>
                                                    {this.props.intl.messages["app.total"]}</Text>
                                            </Col>
                                        </Row>
                                        <Row size={65} style={{paddingTop: 5, paddingBottom: 10}}>
                                            <ListView
                                                dataSource={this.state.data} enableEmptySections={true}
                                                renderRow={(data) => <ReceiptListViewRow data={data}
                                                                                         intl={this.props.intl}
                                                                                         onPress={() => this.openUnitsPopup(data)}/>}
                                                renderFooter={() =>
                                                    <ReceiptListViewFooter total={this.state.total}
                                                                           intl={this.props.intl}
                                                                           discount={this.state.discount}
                                                                           card={this.state.card}/>
                                                }
                                            />
                                        </Row>
                                        <Row size={5}
                                             style={{
                                                 alignItems: 'center',
                                                 justifyContent: 'center',
                                                 paddingBottom: 20
                                             }}>
                                            <Image
                                                style={{width: 91, height: 48}}
                                                source={require('../../images/barcode.gif')}
                                            />
                                        </Row>
                                    </Col>
                                </Row>
                                <Row size={1.5} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                                    <IconButton icon="redo-variant" price="app.return"
                                                intl={this.props.intl} active={this.state.returnButtonPressed}
                                                onPress={() => {
                                                    if (this.props.permissions && this.props.permissions['function_4']) {
                                                        if (!this.state.refunded) {
                                                            this._info.open();
                                                        } else {
                                                            this._returnInfo.open();
                                                        }
                                                    } else {
                                                        this.props.alert(this.props.intl.messages["app.missingPermissions"]);
                                                    }
                                                }}/>
                                    <IconButton icon="printer" price="app.print" intl={this.props.intl}
                                                onPress={this.printReceipt}/>
                                </Row>
                            </Col>
                        }
                    </TouchableOpacity>
                </TouchableOpacity>
                <SelectRefundUnits intl={this.props.intl} ref={elt => this._selectRefundUnits = elt}
                                   onOk={this.refundOnConfirm}/>
                <ActionConfirm ref={elt => this._info = elt} intl={this.props.intl} onOk={this.refundTicket}>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl.messages["app.refundConfirmation"]}</Text></Row>
                </ActionConfirm>
                <ActionConfirm ref={elt => this._returnInfo = elt} intl={this.props.intl} noButtons>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl.messages["app.receiptAlreadyRefunded"]}</Text></Row>
                </ActionConfirm>
            </Modal>
        )
    }
}
