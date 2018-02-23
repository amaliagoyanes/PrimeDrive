import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    Button,
    View,
    TextInput,
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Row, Col} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';


export default class TableNameChange extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false,
            table: {},
            input: props.value || ''
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.okOnPress = this.okOnPress.bind(this);
    }

    open(table){
        this.setState({open: true, table: table})
    }

    close(){
        this.setState({open: false, table: {}, input: ''})
    }

    okOnPress () {
        this.props.onOk(this.state.table, this.state.input);
        this.close();
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
                        top: Dimensions.get('screen').height * 0.175,
                        left: Dimensions.get('screen').width * 0.375,
                        width: Dimensions.get('screen').width * 0.25,
                        height: Dimensions.get('screen').height * 0.2,
                        backgroundColor: '#e3e5e6'
                    }}>
                        <Row size={0.5} style={{alignItems: 'flex-start', justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={this.close}
                                              style={[styles.timesIcon, {marginTop: 0, marginLeft: scale(18), backgroundColor: 'transparent'}]}>
                                <Icon size={scaleText(20)} name="close" color="#313138"/>
                            </TouchableOpacity>
                        </Row>
                        <Row size={1.5} style={{paddingLeft: scale(10), paddingRight: scale(10)}}>
                            <Col>
                                <Row>
                                    <Text style={[styles.text, {color: '#313138', textAlign: 'left'}]}>
                                        {this.props.intl.messages[this.props.message ? this.props.message : "app.changeTableName"]}</Text>
                                </Row>
                                <Row>
                                    <TextInput onChange={(event) => this.setState({input: event.nativeEvent.text})}
                                               style={[styles.text, styles.tableNameChangeInput]} value={this.state.input}
                                               autoFocus={true}/>
                                </Row>
                            </Col>

                        </Row>
                        <Row style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                            <TouchableOpacity onPress={this.close} style={[styles.tabButton, styles.confirmBtn,
                                {backgroundColor: 'transparent',}]}>
                                <Text style={[styles.text, {color: '#313138', fontSize: scaleText(13)}]}>
                                    {this.props.intl.messages["app.cancelUpper"]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.okOnPress}
                                              style={[styles.tabButton, styles.confirmBtn]}>
                                <Text style={[styles.text, {fontSize: scaleText(13)}]}>
                                    {this.props.intl.messages["app.okUpper"]}
                                </Text>
                            </TouchableOpacity>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
