import axios from 'axios';
import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text,
    View,
    ListView,
    AsyncStorage,
    Alert
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Col, Row, Grid} from 'react-native-easy-grid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SwipeALot from 'react-native-swipe-a-lot'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Hideo} from 'react-native-textinput-effects';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import * as Progress from 'react-native-progress';
import firestack from '../fbconfig.js'

import ReactNativeComponentTree from 'react-native/Libraries/Renderer/src/renderers/native/ReactNativeComponentTree';
import {ReceiptItem, ReceiptModal, AlertPopup, NetworkPrinterStatus} from './index';
import styles from '../style/styles';
import {fetchReceipts} from '../api';
import {
    updateCashShiftListener, updateClosedReceipts, updateParkedReceipts, updateCurrentReceipt
} from '../reducers/actions';
import {scale, scaleText} from '../scaling';

class ReceiptsScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalData: [],
            modalVisible: false,
            modalX: 0,
            modalY: 0,
            loading: true,
            search: '',
            bg_loading: false
        };

        let CancelToken = axios.CancelToken;
        this.source = CancelToken.source();
        this.cash_shift_id = props.cash_shift_id;
        this.allowUpdate = false;
        this.showReceipt = this.showReceipt.bind(this);
        this.getReceipts = this.getReceipts.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
    }

    getReceipts() {
        // AsyncStorage.getItem('@PrimeDrive:last_shift_uid').then((uid) => {
        let status = /parked/i.test(this.props.name) ? 'parked' : 'closed';
        this.setState({bg_loading: true});
        fetchReceipts('tickets', {object_uid: this.cash_shift_id, status: status}, this.source.token).then(data => {
            if (this.allowUpdate) {
                this.setState({
                    bg_loading: false
                });
                if (status === 'parked') {
                    this.props.dispatch(updateParkedReceipts(data));
                } else {
                    this.props.dispatch(updateClosedReceipts(data))
                }
            }
        }).catch(err => console.log('GET RECEIPTS err'));
    }

    showReceipt(e, ticket) {
        if (/parked/i.test(this.props.name)) {
            Actions.pop();
            setTimeout(() => this.props.dispatch(updateCurrentReceipt(ticket)), 400);
            setTimeout(() => this.props.dispatch(updateCashShiftListener(true)), 500);
            return
        }
        let screenWidth = Dimensions.get('screen').width,
            screenHeight = Dimensions.get('screen').height,
            modalWidth = screenWidth * 0.2,
            modalHeight = screenHeight * 0.62,
            modalSideMargin = scale(5),
            modalX, modalY,
            arrowStyle = {width: modalSideMargin * 2, height: modalSideMargin * 2},
            arrowExtraWidth = modalSideMargin * Math.cos(45 * (180 / Math.PI));
        ReactNativeComponentTree.getInstanceFromNode(e.currentTarget).measure((fx, fy, width, height, px, py) => {

            if ((width + px + modalWidth + modalSideMargin) > screenWidth) {
                arrowStyle.left = px - arrowStyle.width + arrowExtraWidth;
                modalX = px - modalWidth - modalSideMargin + arrowExtraWidth;
            } else {
                arrowStyle.left = px + width - arrowExtraWidth;
                modalX = width + px + modalSideMargin - arrowExtraWidth;
            }
            if ((height + py + modalHeight) > screenHeight) {
                if ((height + py - modalHeight) < 0)
                    modalY = 0;
                else
                    modalY = height + py - modalHeight;
            }
            else modalY = py;

            arrowStyle.top = py + height / 2 - modalSideMargin;
            this._receiptItem.open({
                visible: true,
                x: modalX, y: modalY,
                arrowStyle: arrowStyle,
                ticket: ticket
            });
        });


    }

    handleValueChange(snapshot) {
        let val = snapshot.val();
        if (val) {
            this.getReceipts();
        }
    }

    componentDidMount() {
        this.allowUpdate = true;
        if (this.props.cash_shift_id) {
            this.cash_shift_id = this.props.cash_shift_id;
            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).on('value', this.handleValueChange)
        } else {
            AsyncStorage.getItem('@PrimeDrive:last_shift_uid').then((uid) => {
                if (uid) {
                    this.cash_shift_id = uid;
                    firestack.database.ref(`/cashShifts/${uid}`).on('value', this.handleValueChange)
                } else {
                    this.setState({data: []})
                }
            }).catch();
        }

        // if (this.props.data) {
        //     this.setState({data: this.props.data});
        // }
    }

    componentWillUnmount() {
        this.allowUpdate = false;
        firestack.database.ref(`/cashShifts/${this.cash_shift_id}`).off('value');
    }

    render() {
        let perSlide = 16,
            perRow = 4,
            rows = 4;

        let data = /parked/i.test(this.props.name) ? this.props.parked_receipts : this.props.closed_receipts;
        if (this.state.search !== '')
            data = data.filter((obj) => {
                return obj.customer_name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 || obj.number.toString().indexOf(this.state.search) !== -1
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
            height: scale(75),
            alignSelf: 'stretch',
        };

        return (
            <Grid style={[styles.container, {paddingLeft: scale(30), paddingTop: scale(25)}]}>
                <Row size={1.5}>
                    <Col size={2}>
                        <Text style={{color: "white", marginTop: 5}}>{this.props.name ?
                            this.props.intl.messages[`app.${this.props.name}`] : this.props.intl.messages['app.receipts']
                        }</Text>
                    </Col>
                    <Col size={9}/>
                    {this.state.bg_loading ?
                        <Col size={1}>
                            <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                                <Progress.Circle borderWidth={1.5} borderColor={"#2dab61"} size={scale(16)}
                                                 indeterminate={true}/>
                            </View>
                        </Col> : <Col size={1}/>
                    }
                    <Col size={2}>
                        <TouchableOpacity onPress={() => {
                            this.allowUpdate = false;
                            // Actions.refresh({key: 'receipts'});
                            this.source.cancel();
                            Actions.pop();
                            setTimeout(() => this.props.dispatch(updateCashShiftListener(true)), 500);
                        }} style={{width: '100%', height: '100%', alignItems: 'flex-end',}}>
                            <View style={[styles.timesIcon, {marginTop: 0, backgroundColor: '#53535a', marginRight: scale(40)}]}>
                                <Icon size={scaleText(20)} name="close" color="white"/>
                            </View>
                        </TouchableOpacity>

                    </Col>
                </Row>
                <Row size={2}>
                    <Col size={1}>
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
                        {data !== null ?
                            data.length > 0 ?
                                <SwipeALot circleDefaultStyle={{
                                    ...dotStyle,
                                    top: scale(-15),
                                    width: scale(8),
                                    borderRadius: scale(10),
                                    height: scale(8),
                                }} circleActiveStyle={activeDotStyle}>
                                    {Array.apply(null, {length: Math.ceil(data.length / perSlide)}).map((d, idxSld) =>
                                        <View style={[styles.slide,]} key={idxSld}>
                                            {Array.apply(null, {length: rows}).map((d, idxRow) =>
                                                <Row key={idxRow}>
                                                    {Array.apply(null, {length: perRow}).map((d, idxItem) =>
                                                        data[idxSld * (perSlide - 1) + idxRow * rows + idxItem] !== undefined ?
                                                            <Col key={idxItem}><TouchableOpacity
                                                                style={[styles.button, {marginLeft: (idxItem === 0 ? 0 : 5)}]}>
                                                                <ReceiptItem
                                                                    onPress={(e) => {
                                                                        let key = idxSld * (perSlide - 1) + idxRow * rows + idxItem;
                                                                        this.showReceipt(e, data[key]);
                                                                    }}
                                                                    intl={this.props.intl}
                                                                    data={data[idxSld * (perSlide - 1) + idxRow * rows + idxItem]}
                                                                />
                                                            </TouchableOpacity>
                                                            </Col> : <Col key={idxItem}/>
                                                    )}
                                                </Row>
                                            )}
                                        </View>
                                    )}
                                </SwipeALot> :
                                <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                                    <Text style={styles.text}>
                                        {/parked/.test(this.props.name) &&
                                        <FormattedMessage id="app.noParkedReceipts"
                                                          defaultMessage="No parked receipts in current cash shift"/>
                                        }
                                        {/closed/.test(this.props.name) &&
                                        <FormattedMessage id="app.noClosedReceipts"
                                                          defaultMessage="No closed receipts in current cash shift"/>
                                        }
                                    </Text>
                                </View> :
                            <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                                <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)}
                                                 indeterminate={true}/>
                            </View>
                        }
                    </Col>
                </Row>
                <ReceiptModal ref={elt => this._receiptItem = elt} departmentId={this.props.departmentId}
                              alert={text => this._alert.open(text)} permissions={this.props.permissions}
                              print={(receipt, isSummary) => this._netprinterStatus.print(receipt, isSummary)}
                              updateClosedReceipts={this.updateClosedReceipts} getReceipts={this.getReceipts}
                              port={this.props.port} intl={this.props.intl} printerType={this.props.printerType}/>
                <NetworkPrinterStatus ref={elt => this._netprinterStatus = elt} intl={this.props.intl}
                                      isUSB={this.props.isUSB} address={this.props.escPrinterAddress}
                                      listening={this.props.listening} setPrinterStatus={() => console.log()}
                                      alert={text => this._alert.open(text)}/>
                <AlertPopup ref={elt => this._alert = elt} intl={this.props.intl}/>
            </Grid>
        )
    }
}

export default connect(({app, intl, receipts}) => ({
    permissions: app.permissions, departmentId: app.departmentId, intl: intl,
    port: app.port, isUSB: app.isUSB, printerType: app.printerType, escPrinterAddress: app.escPrinterAddress,
    closed_receipts: receipts.closed_receipts, parked_receipts: receipts.parked_receipts
}))(ReceiptsScreen)