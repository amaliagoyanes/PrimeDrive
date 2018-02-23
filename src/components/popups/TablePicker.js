import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import {Row} from 'react-native-easy-grid';
import Modal from 'react-native-root-modal';


import {ModalHeader, ModalCloseButton, TablesLayout} from '../index';
import {scale} from '../../scaling';
import styles from '../../style/styles';


export default class TablePicker extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false, data: []
        };

        this.modalName = 'app.selectTableUpper';

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
    }

    open(){
        this.setState({open: true})
    }

    close(){
        this.setState({open: false})
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
                        <Row size={20} style={{padding: scale(15)}}>
                            <TablesLayout onPress={this.props.onPress} extraFilter={{status: 'Free'}}/>
                        </Row>
                        <Row size={0.5}/>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
