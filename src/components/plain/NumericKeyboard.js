import React, {Component} from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    TextInput
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {ButtonItem} from './index';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';


export default class NumericKeyboard extends Component {
    render() {
        let props = this.props;
        let baseFont = this.props.smallBlock ? 14 : 18;
        let deleteFont = this.props.smallBlock ? 11 : 18;
        baseFont = scaleText(baseFont);
        deleteFont = scaleText(deleteFont);
        return (
            <Row size={props.size} style={{marginBottom: props.smallBlock ? 0 : scale(10), backgroundColor: '#404048'}}>
                <Col style={styles.numpadButtonBackground}>
                    <Row style={{backgroundColor: this.props.inputBackgroundColor ? this.props.inputBackgroundColor : '#404048'}}>
                        <Col style={props.postfix ? styles.numpadInputWithPostfix : styles.numpadInput}>
                            <TextInput value={props.input} editable={false}
                                       style={[styles.text, {width: '100%', fontSize: baseFont, textAlign: 'right'}]}/>
                        </Col>
                        {(props.postfix &&
                            <Col style={styles.numpadInputPostfix}>
                                <Text style={[styles.text, {fontSize: baseFont}]}>{props.postfix}</Text>
                            </Col>
                        )}
                    </Row>
                    {Array.apply(null, {length: 3}).map((d, iRow) =>
                        <Row key={iRow}>
                            {Array.apply(null, {length: 3}).map((d, i) =>
                                <ButtonItem key={i} text={(iRow * 3 + i + 1).toString()}
                                            style={styles.numpadButton} disabled={props.disabled}
                                            textStyle={{fontSize: baseFont}}
                                            onPress={() => props.disabled ? () => {} : props.numOnPress((iRow * 3 + i + 1).toString())}/>
                            )}
                        </Row>
                    )}
                    <Row>
                        <Col size={1}>
                            <ButtonItem text="0" style={styles.numpadButton} disabled={props.disabled}
                                        textStyle={{fontSize: baseFont}}
                                        onPress={() => props.disabled ? () => {} : props.numOnPress('0')}/>
                        </Col>
                        {(props.showDelimiter &&
                            <Col>
                                <ButtonItem text="," style={styles.numpadButton} disabled={props.disabled}
                                            textStyle={{fontSize: baseFont}}
                                            onPress={() => props.disabled ? () => {} : props.numOnPress(',')}/>
                            </Col>
                        )}
                        <Col size={props.showDelimiter ? 1 : 2}>
                            <ButtonItem text="app.deleteUpper" style={styles.numpadButton} disabled={props.disabled}
                                        textStyle={{fontSize: deleteFont}} intl={this.props.intl}
                                        onPress={() => props.disabled ? () => {} : props.cleanInput()}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
}