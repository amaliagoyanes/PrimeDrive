import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    View,
    ListView,
    AsyncStorage
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SwipeALot from 'react-native-swipe-a-lot'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Hideo} from 'react-native-textinput-effects';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import * as Progress from 'react-native-progress';

import {IconButton} from './index';
import styles from '../style/styles';
import {fetchData} from '../api';
import {scale, scaleText} from '../scaling';

class CustomersScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            modalData: [],
            modalVisible: false,
            modalX: 0,
            modalY: 0,
            loading: true,
            ticketKeys: [], search: ''
        };
        this.getCustomers = this.getCustomers.bind(this);
    }

    getCustomers() {
        // AsyncStorage.getItem('@PrimeDrive:last_shift_uid').then((uid) => {
        let status = /parked/i.test(this.props.name) ? 'parked' : 'closed';
        // fetchData('tickets', {field_name: 'cash_shift_id', query: this.cash_shift_id}).then(data => {
        fetchData('customers', {}).then(data => {
            let keys = Object.keys(data);
            let customers = keys.map(key => {
                return {...data[key], uid: key}
            });

            this.setState({
                customerKeys: keys,
                data: customers
            });
        }).catch(err => console.log('GET CUSTOMERS'));
        // });
    }

    componentDidMount() {
        this.getCustomers();
    }

    render() {
        let perSlide = 16,
            perRow = 4,
            rows = 4;

        let customers = this.state.data;
        if (this.state.search !== '')
            customers = customers.filter((obj) => {
                return obj.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 || obj.account_number.toString().indexOf(this.state.search) !== -1
            });
        let dotStyle = {
                width: scale(4),
                height: scale(4),
                backgroundColor: 'transparent', margin: scale(7), marginTop: scale(15),
                borderRadius: scale(4),
                borderColor: '#beb3b7', borderWidth: 1,
            },
            activeDotStyle = {
                backgroundColor: '#beb3b7'
            };
        let header = {
            height: scale(40),
            alignSelf: 'stretch',
        };

        return (
            <Grid style={[styles.container, {paddingLeft: scale(30), paddingTop: scale(25)}]}>
                <Row size={1} style={header}>
                    <Col size={2}>
                        <Text style={{color: "white", marginTop: 5}}>Customers</Text>
                    </Col>
                    <Col size={10}/>
                    <Col size={1}>
                        <TouchableOpacity onPress={() => Actions.pop()}
                                          style={[styles.timesIcon, {marginTop: 0, backgroundColor: '#53535a'}]}>
                            <Icon size={scaleText(14)} name="close" color="white"/>
                        </TouchableOpacity>

                    </Col>
                </Row>
                <Row size={2}>
                    <Col size={1}>
                        <TouchableOpacity onPress={() => Actions.createCustomerScreen()}
                                          style={[styles.timesIcon, {marginTop: scale(13), backgroundColor: '#53535a'}]}>
                            <Icon size={scaleText(14)} name="plus" color="white"/>
                        </TouchableOpacity>
                    </Col>
                    <Col size={19}>
                        <Hideo
                            style={{height: scale(16)}}
                            label={'Search'}
                            iconClass={FontAwesomeIcon}
                            iconName={'search'}
                            iconColor={'white'}
                            iconBackgroundColor={'#3f3f48'}
                            inputStyle={{color: 'white', backgroundColor: '#3f3f48'}}
                            onChangeText={(text) => this.setState({search: text})}
                        />
                    </Col>
                    <Col size={1}/>
                </Row>
                <Row size={25} style={{paddingRight: 30}}>
                    <Col>
                        {this.state.data !== null ?
                            this.state.data.length > 0 ?
                                <SwipeALot circleDefaultStyle={{
                                    ...dotStyle,
                                    top: scale(-15),
                                    width: scale(8),
                                    borderRadius: scale(10),
                                    height: scale(8),
                                }} circleActiveStyle={activeDotStyle}>
                                    {Array.apply(null, {length: Math.ceil(this.state.data.length / perSlide)}).map((d, idxSld) =>
                                        <View style={[styles.slide,]} key={idxSld}>
                                            {Array.apply(null, {length: rows}).map((d, idxRow) =>
                                                <Row key={idxRow}>
                                                    {Array.apply(null, {length: perRow}).map((d, idxItem) => {
                                                        let customer = customers[idxSld * (perSlide - 1) + idxRow * rows + idxItem];
                                                        return customer !== undefined ?
                                                                <IconButton style={{marginLeft: (idxItem === 0 ? 0 : 5)}}
                                                                    onPress={(e) => {}} key={idxItem}
                                                                    text={customer.name} price={customer.account_number.toString()}
                                                                />: <Col key={idxItem}/>
                                                    }
                                                    )}
                                                </Row>
                                            )}
                                        </View>
                                    )}
                                </SwipeALot> :
                                <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                                    <Text style={styles.text}>No customers</Text>
                                </View> :
                            <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                                <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)}
                                                 indeterminate={true}/>
                            </View>
                        }
                    </Col>
                </Row>
            </Grid>
        )
    }
}

export default connect(({app}) => ({
    departmentId: app.departmentId,
}))(CustomersScreen)