import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Platform,
    Text, TextInput,
    View, AsyncStorage,
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import DeviceInfo from 'react-native-device-info';
import {Col, Row, Grid} from 'react-native-easy-grid';
import Immersive from 'react-native-immersive';
import {Actions} from 'react-native-router-flux';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import icoMoonConfig from '../fonts/selection.json';
const Icon = createIconSetFromIcoMoon(icoMoonConfig);

import {guid} from './index'
import styles from '../style/styles';
import firestack from '../fbconfig.js'
import {scale, scaleText} from '../scaling';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: false, errorMessage: ''
        };

        this.login = this.login.bind(this);
    }

    componentDidMount() {
        if (Platform.OS !== 'ios') {
            Immersive.on();
            Immersive.setImmersive(true);
        }
    }

    login() {
        if (!this.state.email.length) {
            this._email.focus()
        } else if (!this.state.password.length) {
            this._pwd.focus()
        } else {
            firestack.auth.signInWithEmail(this.state.email, this.state.password)
                .then((user) => {
                    user.user.password = this.state.password;
                    let uuid = DeviceInfo.getUniqueID();
                    let name = DeviceInfo.getDeviceName();
                    if (name === 'Unknown')
                        name = DeviceInfo.getModel();
                    if (!name || name === undefined) {
                        name = 'Tablet';
                    }
                    let data = {name: name,};
                    let token = Platform.OS !== 'ios' ? user.user.token : user.user.refreshToken;
                    firestack.database.ref(`/clients/${uuid}`).set(data).then(response => {
                        try {
                            AsyncStorage.setItem('@PrimeDrive:user', JSON.stringify(user)).then(() => {
                                AsyncStorage.setItem('@PrimeDrive:client', uuid).then(() => {
                                    AsyncStorage.setItem('@PrimeDrive:token', JSON.stringify(token))
                                        .then(() => Actions.home({from: 'login'})).catch();
                                }).catch();
                            });
                        } catch (error) {
                            // Error saving data
                            console.log('error saving', error)
                        }
                    }).catch(err => console.log(err))
                })
                .catch((err) => {
                    console.log('User signin error', err);
                    this.setState({error: true});
                })
        }
    }

    render() {
        return (
            <Grid style={[styles.container, {paddingLeft: 30, paddingTop: scale(25)}]}>
                <Row/>
                <Row size={0.75}>
                    <Col style={{alignItems: 'center'}}>
                        <Icon style={[styles.icon, {top: 0}]} name="logo" size={scaleText(72)} color="white"/>
                    </Col>
                </Row>
                <Row size={0.25}>
                    {this.state.error ?
                        <Text style={[styles.text, {color: '#e84b3a'}]}>
                            <FormattedMessage id="app.incorrectCredentials" defaultMessage="Incorrect username or password" />
                        </Text> :
                        <Text/>
                    }
                </Row>
                <Row size={0.5}>
                    <Col style={{alignItems: 'center'}}>
                        <TextInput
                            ref={elt => this._email = elt}
                            style={styles.loginInput} keyboardType="email-address"
                            underlineColorAndroid={this.state.error ? '#e84b3a' : '#2dab61'}
                            onChangeText={(text) => this.setState({email: text, error: false})}
                            placeholder={'Email'} placeholderTextColor='#cecece' value={this.state.email}
                        />
                    </Col>
                </Row>
                <Row size={0.5}>
                    <Col style={{alignItems: 'center'}}>
                        <TextInput
                            ref={elt => this._pwd = elt}
                            style={styles.loginInput} secureTextEntry={true}
                            underlineColorAndroid={this.state.error ? '#e84b3a' : '#2dab61'}
                            onChangeText={(text) => this.setState({password: text, error: false})}
                            placeholder={'Password'} placeholderTextColor='#cecece' value={this.state.password}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col style={{alignItems: 'center'}}>
                        <TouchableOpacity onPress={this.login}
                                          style={[styles.tabButton, styles.confirmBtn,]}>
                            <Text style={styles.text}><FormattedMessage id="app.login" defaultMessage="LOGIN" /></Text>
                        </TouchableOpacity>
                    </Col>
                </Row>
                <Row/>
            </Grid>
        )
    }
}
