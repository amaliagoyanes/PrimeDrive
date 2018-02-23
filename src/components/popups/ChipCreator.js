import React, {Component} from 'react';
import moment from 'moment';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    TextInput,
    Button,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectMultiple from 'react-native-select-multiple';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling'
import firestack from '../../fbconfig.js';
import AlertPopup from '../index.js';


export default class ChipCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            key: '', type: [], tag_uid: '', types: []
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.okOnPress = this.okOnPress.bind(this);
    }

    open(key) {
        this.setState({open: true, key: key, types: [
                {label: this.props.intl.messages['app.coupon'], value: 'coupon'},
                {label: this.props.intl.messages['app.wristband'], value: 'wristband'},
                {label: this.props.intl.messages['app.mini_wristband'], value: 'mini'},
                {label: this.props.intl.messages['app.gift_card'], value: 'giftcard'},
            ]});
    }

    close() {
        this.setState({open: false, key: '', type: [], tag_uid: ''});
    }

    onTypeChange(type) {
        {/* hack: there's no good component for select dropdown */}
        if (type.length > 1) {
            this.setState({type: type.slice(1)})
        }
        else this.setState({type})
    };

    okOnPress() {
        if (this.state.tag_uid && this.state.type) {
            // let data = {
            //     "balance": 0,
            //     "coupons": 0,
            //     "trips": 0,
            //     "type": this.state.type[0] ? this.state.type[0].value : '',
            //     "last_scan": moment().unix()
            // };
            //
            // firestack.database.ref(`/chips/${this.state.tag_uid}`).set(data).then((snapshot) => {
            //
            // }).catch(err => {
            //     console.log(err);
            // });
            this.props.onSuccess(this.state.tag_uid, this.state.key, this.state.type[0] ? this.state.type[0].value : '');
            this.close();
        }
    }

    render() {
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={() => {
                    if (!this.props.explicitClosing)
                        this.close();
                }}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: Dimensions.get('screen').height * 0.375,
                        left: Dimensions.get('screen').width * 0.375,
                        width: Dimensions.get('screen').width * 0.25,
                        height: Dimensions.get('screen').height * (this.props.noButtons ? 0.2 : 0.25),
                        backgroundColor: '#e3e5e6'
                    }}>
                        <Row size={0.75} style={{alignItems: 'flex-start', justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={this.close}
                                              style={[styles.timesIcon, {
                                                  marginTop: 0, marginLeft: scale(32), padding: scale(5),
                                                  backgroundColor: 'transparent'
                                              }]}>
                                <Icon size={scaleText(20)} name="close" color="#313138"/>
                            </TouchableOpacity>
                        </Row>
                        <Row size={0.75} style={{paddingLeft: scale(10), paddingRight: scale(10)}}>
                            <Text style={[styles.text, {
                                backgroundColor: 'transparent',
                                fontFamily: 'Gotham-Bold',
                                color: '#7771ab',
                                fontSize: scaleText(18)
                            }]}>{this.props.intl !== undefined && this.props.intl.messages["app.tag_uid"]}</Text>
                        </Row>
                        <Row size={0.75} style={{paddingLeft: scale(10), paddingRight: scale(10)}}>
                            <TextInput
                                onChange={(event) => this.setState({tag_uid: event.nativeEvent.text})}
                                style={[styles.text, styles.tableNameChangeInput]}
                                autoFocus={false}/>
                        </Row>
                        <Row size={0.75} style={{paddingLeft: scale(10), paddingRight: scale(10), paddingTop: scale(25)}}>
                            <Text style={[styles.text, {
                                backgroundColor: 'transparent',
                                fontFamily: 'Gotham-Bold',
                                color: '#7771ab',
                                fontSize: scaleText(18)
                            }]}>{this.props.intl !== undefined && this.props.intl.messages["app.type"]}</Text>
                        </Row>
                        <Row size={2} style={{paddingLeft: scale(10), paddingRight: scale(10)}}>
                            <SelectMultiple
                                items={this.state.types}
                                selectedItems={this.state.type}
                                onSelectionsChange={this.onTypeChange}
                                labelStyle={[styles.text, {color: '#7771ab'}]}
                                rowStyle={{backgroundColor: 'transparent', borderBottomWidth: 0, padding: 0}}
                            />
                        </Row>
                        <Row size={1.25} style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                            {!this.props.onlyOkButton &&
                            <TouchableOpacity onPress={this.close} style={[styles.tabButton, styles.confirmBtn,
                                {backgroundColor: 'transparent',}]}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                    {this.props.intl !== undefined && this.props.intl.messages["app.cancelUpper"]}</Text>
                            </TouchableOpacity>
                            }
                            <TouchableOpacity onPress={() => {
                                this.close();
                                this.okOnPress();
                            }}
                                              style={[styles.tabButton, styles.confirmBtn]}>
                                <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                    {this.props.intl !== undefined && this.props.intl.messages["app.okUpper"]}</Text>
                            </TouchableOpacity>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
