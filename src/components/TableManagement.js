import moment from 'moment';
import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    View,
    ListView,
    Platform,
    Alert
} from 'react-native';
import Immersive from 'react-native-immersive';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import firestack from '../fbconfig.js';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import icoMoonConfig from '../fonts/selection.json';

const Icon = createIconSetFromIcoMoon(icoMoonConfig);
import {scale, scaleText} from '../scaling';

import {
    SideMenu,
    OpenDay,
    CloseDay,
    CheckInOut,
    UserLogin,
    SubProducts,
    AlertPopup,
    TableNameChange,
    TablesLayout
} from './index';

import styles from '../style/styles';

class TableManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            curTime: moment().format('HH:mm:ss - DD.MM.YYYY'),
        }

        this.onNameChange = this.onNameChange.bind(this);
    }

    componentDidMount() {
        if (Platform.OS !== 'ios') {
            Immersive.on();
            Immersive.setImmersive(true);
        }
        this.timer = setInterval(() => {
            this.setState({
                curTime: moment().format('HH:mm:ss - DD.MM.YYYY')
            })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        firestack.database.ref(`/clients/${this.props.client_id}/`).off('value')
    }

    onNameChange(table, name) {
        if (name && name !== '')
            firestack.database.ref(`/tables/${table.uid}`).update({name: name}).then((snapshot) => {
                this._tablesLayout.getTables()
            });
        else this._alert.open(this.props.intl.messages["app.emptyName"])
    }

    render() {
        return (
            <Grid style={styles.container}>
                <Row style={{height: scale(35), alignItems: 'flex-start'}}>
                    <Col size={0.075} style={{height: scale(35), alignItems: 'center', justifyContent: 'center'}}>
                        <Icon style={[styles.icon, {top: scale(5)}]} name="logo" size={scaleText(25)} color="white"/>
                    </Col>
                    <Col size={0.175} style={{height: scale(35), alignItems: 'flex-start', justifyContent: 'center'}}>
                        <Text style={styles.text}>PrimeDrive</Text>
                    </Col>
                    <Col size={0.5} style={{height: scale(35), alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={[styles.text, {fontSize: scaleText(10)}]}>
                            KL. {this.state.curTime}</Text>
                    </Col>
                    <Col size={0.25} style={{
                        height: scale(35),
                        marginRight: scale(10),
                        alignItems: 'flex-end',
                        justifyContent: 'center'
                    }}>
                        <Text style={styles.text}>{this.state.name}</Text>
                    </Col>
                </Row>
                <Row name="navbar" style={{height: scale(38)}}>
                    <Col size={5}>
                        <TouchableOpacity style={[styles.flex, {padding: scale(5)}]} onPress={() => this._menu.open()}>
                            <Icon style={styles.icon} name="menu" size={scaleText(22)} color="white"/>
                        </TouchableOpacity>
                    </Col>
                    <Col size={85}/>
                    <Col size={5}>
                        <TouchableOpacity style={[styles.flex, {padding: scale(5)}]} onPress={() => Actions.home()}>
                            <Icon style={styles.icon} name="home" size={scaleText(20)} color="white"/>
                        </TouchableOpacity>
                    </Col>
                    <Col size={5}>
                        <TouchableOpacity style={[styles.flex, {padding: scale(5)}]}
                                          onPress={() => this._userLogin.open()}>
                            <Icon style={styles.icon} name="person" size={scaleText(20)} color="white"/>
                        </TouchableOpacity>
                    </Col>
                    {/*<Col size={5}>*/}
                    {/*<TouchableOpacity style={[styles.flex, {padding: scale(5)}]} onPress={() => this._subProducts.open()}>*/}
                    {/*<Icon style={styles.icon} name="search" size={scaleText(20)} color="white"/>*/}
                    {/*</TouchableOpacity>*/}
                    {/*</Col>*/}
                </Row>
                <TablesLayout ref={elm => this._tablesLayout = elm} showTypeButtons
                              onPress={(table) => this._tableNameChange.open(table)}/>
                <Row/>
                <SideMenu ref={elt => this._menu = elt} intl={this.props.intl}
                          openModal={(modal) => this['_' + modal].open()}/>
                <OpenDay ref={elt => this._openDay = elt} intl={this.props.intl}/>
                <CloseDay ref={elt => this._closeDay = elt} intl={this.props.intl}/>
                <CheckInOut ref={elt => this._checkInOut = elt} intl={this.props.intl}/>
                <UserLogin ref={elt => this._userLogin = elt} intl={this.props.intl}/>
                <AlertPopup ref={elt => this._alert = elt} intl={this.props.intl}/>
                <TableNameChange ref={elt => this._tableNameChange = elt} intl={this.props.intl}
                                 onOk={this.onNameChange}/>
            </Grid>
        )
    }
}

export default connect(({app, intl}) => ({
    intl: intl
}))(TableManagement)