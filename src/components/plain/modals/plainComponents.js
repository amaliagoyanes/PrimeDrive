import moment from 'moment';
import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Col, Row} from 'react-native-easy-grid';
import styles from '../../../style/styles';
import {scale, scaleText} from '../../../scaling';
import {Timer} from '../index.js';


export const ModalCloseButton = (props) => (
    <Row size={1}>
        <Col size={20}/>
        <Col size={1}>
            <TouchableOpacity onPress={props.close}
                              style={[styles.bigTimesIcon, {
                                  marginTop: 0, marginLeft: scale(32), padding: scale(5),
                                  backgroundColor: 'transparent'
                              }]}>

                <Icon size={scaleText(32)} name="close" color="#313138"/>
            </TouchableOpacity>
        </Col>
    </Row>
);

export class ModalHeader extends React.Component {
    constructor(props) {
        super(props);

        this.getToday = this.getToday.bind(this);
    }


    getToday() {
        return moment().format('DD.MM.YYYY');
    }

    render() {
        let props = this.props;
        return (
            <Row size={1} style={styles.modalHeader}>
                <Col size={1}>
                    <Timer style={{
                        fontSize: scaleText(12), color: '#313138', textAlign: 'left'
                    }}/>
                </Col>
                <Col size={1}>
                    <Text style={[styles.text, {
                        fontSize: scaleText(14), color: '#313138', textAlign: 'center'
                    }]}>{props.intl !== undefined && props.intl.messages[props.modalName]} </Text>
                </Col>
                <Col size={1}>
                    <Text style={[styles.text, {
                        fontSize: scaleText(12),
                        color: '#313138',
                        textAlign: 'right'
                    }]}>{this.getToday()}</Text>
                </Col>
            </Row>
        )
    }
}
