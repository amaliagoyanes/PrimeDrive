import axios from 'axios';
import React, {Component} from 'react';
import {
    Dimensions, TouchableOpacity, Text, View,
    ListView, AsyncStorage, Alert
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {FormattedMessage} from 'react-intl';
import Immersive from 'react-native-immersive';
import {Hideo} from 'react-native-textinput-effects';
import SwipeALot from 'react-native-swipe-a-lot';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {IconButton,} from './index';
import {scale, scaleText} from '../scaling';
import {fetchData} from '../api';
import firestack, {urlBase} from '../fbconfig.js'

import {
    updateCashShiftListener, updateUserUID, updatePermissions, updateUserNumber
} from '../reducers/actions';
import * as Progress from 'react-native-progress';

import styles from '../style/styles';
import plainStyles from '../style/plain';


class UserLoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], processing: false, search: '', loggedUsers: []
        };

        this.login = this.login.bind(this);
        this.getData = this.getData.bind(this);
        this.getItems = this.getItems.bind(this);
    }

    getData() {
        fetchData('users', {role: 'user'}).then(result => {
            this.setState({data: result, open: true});
        });
        firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).once('value').then(snapshot => {
            let val = snapshot.val();
            if (!!val.users)
                this.setState({loggedUsers: val.users.split(',')});
        })
    }

    componentDidMount() {
        Immersive.on();
        Immersive.setImmersive(true);
        if (this.state.data.length === 0) {
            this.getData();
        }
    }

    login(number, uid) {
        this.setState({processing: true});
        firestack.auth.getToken().then(res => {
            let url = `${urlBase}/develop/auth-by-number`;
            let token = res.token;
            let instance = axios.create({
                headers: {idtoken: token},
            });
            let data = {number: number};
            if (this.state.loggedUsers.indexOf(`${uid}`) === -1) {
                let users = this.state.loggedUsers;
                users.push(`${uid}`);
                users = users.join(',');
                firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).update({users: users});
            }
            this.props.dispatch(updateUserNumber(number));
            this.props.dispatch(updateUserUID(uid));
            instance.post(url, data)
                .then(response => {
                    this.setState({processing: false});
                    AsyncStorage.setItem('@PrimeDrive:user_info',
                        JSON.stringify({
                            number: response.data.db_data.number, name: response.data.db_data.name,
                            permissions: response.data.db_data.permissions
                        }))
                        .then(() => {
                            this.props.dispatch(updatePermissions(response.data.db_data.permissions || {}));
                        });
                    AsyncStorage.setItem('@PrimeDrive:user_uid', response.data.auth_data.uid);
                    Actions.pop()
                }).catch(err => {
                console.log('lambda post', err);
                this.props.dispatch(updateUserNumber(''));
                this.setState({processing: false, error: true});
            })
        }).catch(err => {
            console.log('auth token', err);
            this.setState({processing: false, error: true});
        });
    }

    getItems() {
        let users = Object.keys(this.state.data).map(key => {
            return {...this.state.data[key], uid: key}
        });
        if (this.state.search !== '')
            users = users.filter((obj) => {
                return obj.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 || obj.number.toString().indexOf(this.state.search) !== -1
            });
        else
            users = users.filter((obj) => {
                return obj.uid === this.props.user_uid || this.state.loggedUsers.indexOf(`${obj.uid}`) !== -1;
            });

        users.sort((a,b) => (a.name > b.name ) ? 1 : (b.name > a.name) ? -1 : 0);

        let perRow = 7,
            rows = 7,
            perSlide = 49,
            slides = Math.ceil(users.length / perSlide);
        return Array.apply(null, {length: slides}).map((d, idxSld) =>
            <Col style={[styles.slide, {marginBottom: 0}]} key={idxSld}>
                {Array.apply(null, {length: rows}).map((d, idxRow) =>
                    <Row key={idxRow}>
                        {Array.apply(null, {length: perRow}).map((d, idxItem) => {
                            let item = users[idxSld * (perSlide - 1) + idxRow * rows + idxItem];
                            if (item) {
                                return <IconButton key={idxItem} text={item.name} active={item.uid === this.props.user_uid}
                                                   price={item.number.toString()}
                                                   onPress={() => this.login(item.number, item.uid)}/>
                            } else {
                                return <Col key={idxItem}/>
                            }
                        })}
                    </Row>
                )}
                <Row size={0.1}/>
            </Col>
        )
    }

    render() {
        return (
            <Grid style={[styles.container, {paddingLeft: scale(30), paddingTop: scale(25)}]}>
                <Row size={1.5}>
                    <Col size={2}>
                        <Text style={{color: "white", marginTop: 5}}>
                            <FormattedMessage id="app.userLogin" defaultMessage="User login" />
                        </Text>
                    </Col>
                    <Col size={10}/>
                    <Col size={2}>
                        <TouchableOpacity onPress={() => {
                            Actions.pop();
                            setTimeout(() => this.props.dispatch(updateCashShiftListener(true)), 500);
                        }} style={{width: '100%', height: '100%', alignItems: 'flex-end',}}>
                            <View style={[styles.timesIcon, {
                                marginTop: 0,
                                backgroundColor: '#53535a',
                                marginRight: scale(40)
                            }]}>
                                <Icon size={scaleText(20)} name="close" color="white"/>
                            </View>
                        </TouchableOpacity>

                    </Col>
                </Row>
                <Row size={2}>
                    <Col size={1}>
                        <Hideo
                            style={{height: scale(16)}}
                            label={'Search'}
                            iconClass={FontAwesomeIcon}
                            iconName={'search'}
                            iconColor={'white'}
                            iconBackgroundColor={'#3f3f48'}
                            inputStyle={{color: 'white', backgroundColor: '#3f3f48'}}
                            onChangeText={(text) => this.setState({search: text})}
                        />
                    </Col>
                    <Col size={1}/>
                </Row>
                <Row size={25} style={{paddingRight: 30}}>
                    <Col>
                        {(!Object.keys(this.state.data).length) ?
                            <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                                <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)} indeterminate={true} />
                            </View> :
                            <SwipeALot circleDefaultStyle={{...plainStyles.dotStyleModal, top: scale(5)}}
                                       circleActiveStyle={plainStyles.activeDotStyleModal}>
                                {this.getItems()}
                            </SwipeALot>
                        }
                    </Col>
                </Row>
            </Grid>
        )
    }
}

export default connect(({app, intl, receipts}) => ({
    uid: app.uid, token: app.token, user_uid: app.user_uid, userNumber: app.userNumber,
    customer_uid: app.customer_uid, dealer_uid: app.dealer_uid, departmentId: app.departmentId, settings: app.settings,
    client_id: app.client_id, client_name: app.client_name, cash_shift_id: app.cash_shift,
    permissions: app.permissions, intl: intl, shouldUpdate: app.shouldUpdate
}))(UserLoginScreen)