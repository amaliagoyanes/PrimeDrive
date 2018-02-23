import React, {Component} from 'react';
import {
    Text,
} from 'react-native';
import moment from 'moment';

import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';

export default class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curTime: moment().format('HH:mm:ss - DD.MM.YYYY')
        };
        this.triggered = false;
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            if (this.props.settings && this.props.settings.close_shift && !this.triggered) {
                if (this.props.settings.close_shift === moment().format('HH:mm')) {
                    console.log('LAUNCHED');
                    this.triggered = true;
                    this.props.reopenShift();
                } else if (this.triggered && this.props.settings.close_shift !== moment().format('HH:mm')) {
                    this.triggered = false;
                }
            }
            this.setState({
                curTime: moment().format('HH:mm:ss - DD.MM.YYYY')
            })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return (
            <Text style={[styles.text, {fontSize: scaleText(10)}, this.props.style]}>{this.state.curTime}</Text>
        )
    }
}