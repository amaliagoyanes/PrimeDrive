import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    View,
    Alert
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Row, Col} from 'react-native-easy-grid';
import styles from '../../style/styles';
import Modal from 'react-native-root-modal';
import {NumericKeyboard} from '../index.js'
import {scale, scaleText} from '../../scaling'


export default class NumberPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '', open: false, px: 0, py: 0
        };

        this.numOnPress = this.numOnPress.bind(this);
        this.cleanInput = this.cleanInput.bind(this);
        this.confirm = this.confirm.bind(this);
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    open(px, py, uid, negative=false) {
        this.setState({open: true, px: px, py: py, uid: uid, negative: negative})
    }

    close() {
        this.setState({open: false, input: ''})
    }

    numOnPress(text) {
        if (this.props.lockZero && this.state.input.length <= 0 && Number(text) === 0) 
            return;
        let newVal = this.state.input + text,
            max = this.props.max;
        if (max && parseFloat(newVal) > max) {
            this.props.alert(this.props.intl.messages["app.notGreaterThan"] + max);
            return;
        }
        this.setState({input: newVal})
    }

    cleanInput(){
        if (this.props.deleteAll)
            this.setState({input: ''});
        else
            this.setState({input: this.state.input.slice(0, this.state.input.length - 1)});
    }

    confirm(){
        if (this.props.onOk !== undefined)
            this.props.onOk(this.state.negative ? parseFloat(-this.state.input) : parseFloat(this.state.input), null, this.state.uid);
        this.close();
    }

    render() {
        let left = this.props.arrow === 'left' ?
            this.state.px + 10 : this.state.px - Dimensions.get('screen').width * 0.15 - 10;
        let leftArrow = this.props.arrow === 'left' ?
            this.state.px : this.state.px - 15;
        let py = this.state.py > Dimensions.get('screen').height / 2 ? 215 : 50;

        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <View style={{
                        position: 'absolute',
                        top: this.state.py + 15,
                        left: leftArrow,
                    }}>
                        <View
                            style={this.props.arrow === 'left' ? [styles.triangle, styles.leftTriangle] : styles.triangle}/>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: this.state.py - py,
                        left: left,
                        width: Dimensions.get('screen').width * 0.15,
                        height: Dimensions.get('screen').height * 0.4,
                        backgroundColor: '#404048'
                    }}>
                        <NumericKeyboard size={6} numOnPress={this.numOnPress} input={this.state.input}
                                         lockZero={this.props.lockZero}
                                         cleanInput={this.cleanInput} smallBlock intl={this.props.intl}
                                         showDelimiter={this.props.showDelimiter} postfix={this.props.postfix}/>
                        <Row size={1}>
                            <TouchableOpacity style={[styles.tabButton, {width: '100%', backgroundColor: this.state.input.length ? '#2eab61' : '#93D8B1' }]} // '#93D8B1'
                                              onPress={this.confirm} disabled={!this.state.input.length}>
                                <Text style={[styles.text, {fontSize: scaleText(9)}]}>
                                    {this.props.intl !== undefined && this.props.intl.messages["app.okUpper"]}</Text>
                            </TouchableOpacity>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
