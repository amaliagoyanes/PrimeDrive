import React, {Component} from 'react';
import {
    Text, View
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import * as Progress from 'react-native-progress';
import {ButtonItem, NumericKeyboard} from '../index';
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';


export default class UserLoginBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '', error: false
        };

        this.numOnPress = this.numOnPress.bind(this);
    }

    numOnPress(text) {
        this.setState({input: this.state.input + text, error: false})
    }

    render() {
        let input = this.state.input;
        if (this.props.processing) {
            return (
                <Col size={4} style={styles.userLoginRight}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                        <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)} indeterminate={true} />
                    </View>
                </Col>
            )
        }
        return (
            <Col size={4} style={styles.userLoginRight}>
                <Row size={1} style={{justifyContent: 'center', alignItems: 'center'}}>
                    {this.state.error ?
                        <Text style={[styles.text, {color: '#e84b3a'}]}>
                            {this.props.intl !== undefined &&
                            this.props.intl.messages["app.noUser"]
                            }</Text> :
                        <Col/>
                    }
                </Row>
                <NumericKeyboard size={6.5} numOnPress={this.numOnPress} input={input} intl={this.props.intl}
                                 cleanInput={() => this.setState({input: input.slice(0, input.length - 1)})}/>
                <Row size={1.25}>
                    <ButtonItem text="app.login" onPress={() => this.props.login(this.state.input)} intl={this.props.intl}
                                style={[styles.modalButton, {backgroundColor: '#3cb671', marginRight: 0}]}
                                textStyle={styles.modalButtonText}/>
                </Row>
            </Col>
        )
    }
}
