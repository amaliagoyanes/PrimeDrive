import React, {Component} from 'react';
import {View,} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import SwipeALot from 'react-native-swipe-a-lot';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Hideo} from 'react-native-textinput-effects';
import * as Progress from 'react-native-progress';

import {IconButton,} from '../index';
import styles from '../../style/styles';
import plainStyles from '../../style/plain';
import {scale, scaleText} from '../../scaling';


export default class UserSearchBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], search: ''
        };

        this.getItems = this.getItems.bind(this);
    }

    getItems() {
        let users = Object.keys(this.props.data).map(key => {
            return {...this.props.data[key], uid: key}
        });
        if (this.state.search !== '')
            users = users.filter((obj) => {
                return obj.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 || obj.number.toString().indexOf(this.state.search) !== -1
            });


        let perRow = 4,
            rows = 4,
            perSlide = 16,
            slides = Math.ceil(users.length / perSlide);
        return Array.apply(null, {length: slides}).map((d, idxSld) =>
            <Col style={[styles.slide, {marginBottom: 0}]} key={idxSld}>
                {Array.apply(null, {length: rows}).map((d, idxRow) =>
                    <Row key={idxRow}>
                        {Array.apply(null, {length: perRow}).map((d, idxItem) => {
                            let item = users[idxSld * (perSlide - 1) + idxRow * rows + idxItem];
                            if (item) {
                                return <IconButton key={idxItem} text={item.name}
                                                   price={item.number.toString()} active
                                                   onPress={() => this.props.login(item.number)}/>
                            } else {
                                return <Col key={idxItem}/>
                            }
                        })}
                    </Row>
                )}
                <Row size={0.1}/>
            </Col>
        )
    }

    render() {
        return (
            <Col size={6} style={styles.userLoginLeft}>
                <Row size={1} style={{paddingRight: scale(5), paddingLeft: scale(5)}}>
                    <Col>
                        <Hideo
                            style={{alignItems: 'center', justifyContent: 'center'}}
                            label={'Search'}
                            iconClass={FontAwesomeIcon}
                            iconName={'search'}
                            iconColor={'black'}
                            iconBackgroundColor={'transparent'}
                            inputStyle={{
                                color: 'black',
                                backgroundColor: 'transparent',
                                fontSize: scaleText(20)
                            }}
                            onChangeText={text => this.setState({search: text}) }
                        />
                    </Col>
                </Row>
                <Row size={8}>
                    {(!Object.keys(this.props.data).length) ?
                        <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                            <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)} indeterminate={true} />
                        </View> :
                        <SwipeALot circleDefaultStyle={{...plainStyles.dotStyleModal, top: scale(5)}}
                                   circleActiveStyle={plainStyles.activeDotStyleModal}>
                            {this.getItems()}
                        </SwipeALot>
                    }
                </Row>
            </Col>
        )
    }
}
