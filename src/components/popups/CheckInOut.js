import moment from 'moment';
import React, {Component} from 'react';
import {
    AsyncStorage,
    Dimensions,
    TouchableOpacity,
    Text,
    View,
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import firestack from '../../fbconfig.js'
import {ButtonItem, IconButton, ModalHeader, ModalCloseButton, guid} from '../index';
import {scale, scaleText} from '../../scaling'


export default class CheckInOut extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, name: '', number: '', uid: null, timestamp: null
        };

        this.modalName = 'PUNCH IN OR OUT';

        this.checkInOut = this.checkInOut.bind(this);
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    open() {
        this.setState({open: true}, () => this.loadData())
    }

    close() {
        this.setState({open: false})
    }

    loadData() {
        AsyncStorage.getItem('@PrimeDrive:user_info')
            .then(info => {
                info = JSON.parse(info);
                AsyncStorage.getItem('@PrimeDrive:checkin_uid').then(checkin => {
                    this.setState({number: info.number, name: info.name, uid: checkin}, () =>
                        AsyncStorage.setItem('@PrimeDrive:checkin_timestamp').then(timestamp =>
                            this.setState({timestamp: timestamp})).catch()
                    );
                }).catch();
            })
            .catch(err => console.log(err));
    }

    checkInOut() {
        if (this.state.uid === null) { //no checkin
            let uid = guid();
            let checkin_time = moment().unix();
            let data = {
                checkin_time: checkin_time,
                client: this.props.client_id,
                user_id: this.props.user_uid,
                customer_uid: this.props.customer_uid,
                dealer_uid: this.props.dealer_uid,
                status: 'new',
            };
            firestack.database.ref(`/userCheckins/${uid}`).set(data).then(response => {
                AsyncStorage.setItem('@PrimeDrive:checkin_uid', uid.toString()).then(() => {
                    AsyncStorage.setItem('@PrimeDrive:checkin_timestamp', checkin_time.toString()).then(() => {
                        this.setState({uid: uid, timestamp: checkin_time.toString()});
                        this.close();
                    }).catch();
                }).catch();
            }).catch(err => console.log(err));
        } else { //checkout action
            firestack.database.ref(`/userCheckins/${this.state.uid}`).once('value').then((snapshot) => {
                let val = snapshot.val();
                val.checkout_time = moment().unix();
                val.status = 'current';
                firestack.database.ref(`/userCheckins/${this.state.uid}`).set(val).then(response => {
                    AsyncStorage.removeItem('@PrimeDrive:checkin_uid').then().catch();
                    AsyncStorage.removeItem('@PrimeDrive:checkin_timestamp').then().catch();
                    this.setState({uid: null, timestamp: null, open: false});
                })
            });
        }
    }

    render() {
        let active = this.state.uid !== null;
        let diff = this.state.timestamp ? moment().diff(moment.unix(this.state.timestamp), 'minutes') : '';
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
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
                        paddingBottom: scale(50),
                    }}>
                        <ModalCloseButton close={this.close}/>
                        <ModalHeader modalName={this.modalName}/>
                        <Row size={5}/>
                        <Row size={13} style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Col/>
                            <Col size={2}>
                                <Row>
                                    <Col size={1}>
                                        <IconButton style={{
                                            height: scale(90),
                                            marginLeft: 0,
                                            marginRight: 0,
                                            backgroundColor: '#404048'
                                        }}
                                                    text={this.state.name} price={this.state.number} active/>
                                    </Col>
                                    <Col size={3} style={{marginLeft: scale(45), paddingTop: scale(5)}}>
                                        <Row size={1}>
                                            <Text style={[styles.text, {fontSize: scaleText(10), color: '#313138'}]}>KASPER
                                                SJ</Text>
                                        </Row>
                                        <Row size={3}>
                                            <Text
                                                style={[styles.text, {fontSize: scaleText(23), color: '#313138'}]}>
                                                {active ? this.props.intl.messages["app.checkedIn"] :
                                                    this.props.intl.messages["app.checkedOut"]}
                                            </Text>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <ButtonItem text="app.punchIn" onPress={this.checkInOut} disabled={active}
                                                intl={this.props.intl}
                                                style={[styles.modalButton, {
                                                    backgroundColor: !active ? '#3cb671' : '#bec3c7', marginRight: 0
                                                }]}
                                                textStyle={[styles.modalButtonText]}/>
                                </Row>
                                <Row>
                                    <ButtonItem text="app.punchOut" onPress={this.checkInOut} disabled={!active}
                                                intl={this.props.intl}
                                                style={[styles.modalButton, {
                                                    backgroundColor: active ? '#3cb671' : '#bec3c7', marginRight: 0
                                                }]}
                                                textStyle={[styles.modalButtonText]}/>
                                </Row>
                                <Row>
                                    <Text style={[styles.text, {
                                        color: '#313138',
                                        marginTop: scale(40),
                                        fontSize: scaleText(10)
                                    }]}>
                                        {this.state.timestamp !== null && this.props.intl !== undefined &&
                                            this.props.intl.messages["app.currentTimeUpper"]
                                        }
                                        {this.state.timestamp !== null &&
                                        `${parseInt(diff / 60)}:${diff % 60}`
                                        }
                                    </Text>
                                </Row>
                            </Col>
                            <Col/>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
