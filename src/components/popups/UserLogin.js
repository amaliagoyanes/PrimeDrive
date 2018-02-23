import axios from 'axios';
import React, {Component} from 'react';
import {
    Dimensions, AsyncStorage,
    TouchableOpacity,
} from 'react-native';
import {Row} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import {scale} from '../../scaling';
import {fetchData} from '../../api';
import firestack, {urlBase} from '../../fbconfig.js'

import {UserLoginBlock, UserSearchBlock, ModalHeader, ModalCloseButton, } from '../index';
import {updateUserUID, updatePermissions} from '../../reducers/actions';

import styles from '../../style/styles';


export default class UserLogin extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false, data: [], processing: false
        };

        this.modalName = 'app.welcomeUpper';

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.login = this.login.bind(this);
        this.getData = this.getData.bind(this);
    }

    getData() {
        fetchData('users', {role: 'user'}).then(result => {
            this.setState({data: result, open: true});
        });
    }

    open(){
        this.setState({open: true}, () => {
            if (this.state.data.length === 0) {
                this.getData();
            }
        });
    }

    close(){
        this.setState({open: false})
    }

    login(number) {
        this.setState({processing: true});
        firestack.auth.getToken().then(res => {
            let url = `${urlBase}/develop/auth-by-number`;
            let token = res.token;
            let instance = axios.create({
                headers: {idtoken: token},
            });
            console.log('NUMBER', number);
            let data = {number: number};
            instance.post(url, data)
                .then(response => {
                    this.setState({processing: false});
                    this.close();
                    AsyncStorage.setItem('@PrimeDrive:user_info',
                        JSON.stringify({number: response.data.db_data.number, name: response.data.db_data.name,
                            permissions: response.data.db_data.permissions}))
                        .then(() => {
                            this.props.dispatch(updateUserUID(response.data.auth_data.uid));
                            this.props.dispatch(updatePermissions(response.data.db_data.permissions || {}));
                        });
                    AsyncStorage.setItem('@PrimeDrive:user_uid', response.data.auth_data.uid);
                    AsyncStorage.getItem('@PrimeDrive:last_shift_uid').then((value) => {
                        if (!value) {
                            this.props.openShift();
                        }
                    });
                }).catch(err => {
                console.log('lambda post', err);
                this.setState({processing: false, error: true});
            })
        }).catch(err => {
            console.log('auth token', err);
            this.setState({processing: false, error: true});
        });
    }


    render() {
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
                        paddingBottom: scale(20)
                    }}>
                        <ModalCloseButton close={this.close}/>
                        <ModalHeader modalName={this.modalName} intl={this.props.intl}/>
                        <Row size={20}>
                            <UserSearchBlock data={this.state.data}
                                             login={(id) => this.login(id)}/>

                            <UserLoginBlock token={this.props.token} close={this.close} login={this.login}
                                            ref={elt => this._login = elt} intl={this.props.intl} processing={this.state.processing}
                                            openShift={this.props.openShift} dispatch={this.props.dispatch} />
                        </Row>
                        <Row size={0.5}/>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
