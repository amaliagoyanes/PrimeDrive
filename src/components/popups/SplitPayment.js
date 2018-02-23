import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text, FlatList,
    View, ListView,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import SwipeALot from 'react-native-swipe-a-lot';
import Modal from 'react-native-root-modal';
import * as Progress from 'react-native-progress';
import {ButtonItem, IconButton, ModalHeader, ModalCloseButton, SectionHeader, ListViewRow, ReceiptTotals,
    AlertPopup, NumberPopup, ActionConfirm, Payment, TicketBlock
} from '../index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {fetchData} from '../../api';
import styles from '../../style/styles';
import plainStyles from '../../style/plain';
import {scale, scaleText} from '../../scaling';

export default class SplitPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            activeBtn: null,
            dataSource: [],
            dataSourceSplitted: [],
        };
        this.modalName = 'app.split_payment';
        this.splittedName = 'splitted';
        this.fullName = 'full';
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.getButtons = this.getButtons.bind(this);
        this.getReceptTitle = this.getReceptTitle.bind(this);
        this.getActions = this.getActions.bind(this);
        this.splitUnit = this.splitUnit.bind(this);
    }
    
    open() {
        this.setState({
            open: true
        });
    }

    close() {
        this.setState({open: false, activeBtn: null});
    }

    getReceptTitle(text) {
        return (text !== undefined && typeof text === 'string') ? text.toUpperCase() : '';
    }

    splitUnit(amount, n, data) {
        this.props.updateLineWithSplit(amount, data.uid);
    }

    getActions(receiptName, px, py, data, width, height) {
        let name = (typeof receiptName === 'string') ? receiptName.toLowerCase() : '';
        switch (this.state.activeBtn) {
            case 'button_1':
                if (name === this.fullName) {
                    this.props.cloneDataSource(1, data, this.fullName, this.splittedName);
                }
                break;
            case 'button_2':
                if (name === this.fullName) {
                    this.props.cloneDataSource(data.units, data, this.fullName, this.splittedName);
                }
                break;
            case 'button_3':
                if (name === this.fullName) {
                    this._splitUnit.open(px+width, py, data);
                }
                break;
            case 'button_4':
                if (name === this.splittedName) {
                    this.props.cloneDataSource(1, data, this.splittedName, this.fullName);
                }
                break;
            case 'button_5':
                if (name === this.splittedName) {
                    this.props.cloneDataSource(data.units, data, this.splittedName, this.fullName);
                }
                break;
        }
    }

    getButtons() {
        let style = {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
        };
        let buttons = {
            'button_1': {
                icon: 'chevron-right',
                price: this.props.intl.messages["app.moveUnit"]
            },
            'button_2': {
                icon: 'chevron-double-right',
                price: this.props.intl.messages["app.moveLine"],
            },
            'button_3': {
                icon: 'call-split',
                price: this.props.intl.messages["app.splitUnit"],
                style: {paddingBottom: scale(10)},
                measures: {}
            },
            'button_4': {
                icon: 'chevron-left',
                price: this.props.intl.messages["app.returnUnit"],
            },
            'button_5': {
                icon: 'chevron-double-left',
                price: this.props.intl.messages["app.returnLine"],
            }
        };

        return (
            <View style={[style, {padding: scale(40)}]}>
                {['button_1', 'button_2', 'button_3', 'button_4', 'button_5'].map((key, i) => {
                    return <Row key={key} size={1} style={styles.buttonReceiptAction}>
                        <IconButton {...buttons[key]} active={this.state.activeBtn === key ? true:false} onPress={()=>{
                                this.setState({activeBtn: key});
                            }}/>
                    </Row>
                })}
            </View>
        )
    }

    render() {
        let splittedSize = this.props.dataSource.reduce((total, item) => {
            return total += item.splitUnits > 0 ? 1 : 0;
        }, 0);
        
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
                        <Row size={15}>
                            <Col size={10}>
                                <Row size={1}>
                                    <Text style={styles.splitReceiptsHead}>{this.getReceptTitle(this.props.intl.messages["app.fullReceipt"])}</Text>
                                </Row>
                                <Row size={16} style={{paddingBottom: scale(20)}}>
                                    <ReceiptView ref={elt => this._receiptFull = elt}
                                        dataSource={this.props.dataSource}
                                        intl={this.props.intl}
                                        getActions={this.getActions}
                                        name={this.fullName}
                                        getTotalWithDiscount={this.props.getTotalWithDiscount}
                                        discount={this.props.discount}
                                        />
                                </Row>
                                <Row size={3} style={{marginLeft: scale(-5), marginRight: scale(-5)}}>
                                    <Col style={styles.buttonReceiptAction}>
                                        <IconButton
                                            icon={'call-split'}
                                            price={this.props.intl.messages["app.splitEqual"]}
                                            measures={true}
                                            onPress={(px, py, width, height)=> {
                                                if (this.props.permissions && this.props.permissions['function_18']) {
                                                    this.props.dataSource.length > 0 ? this._splitReceipt.open(width+px, py) : this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                                                } else {
                                                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col style={styles.buttonReceiptAction}>
                                        <IconButton
                                            icon={'pause'}
                                            price={this.props.intl.messages["app.park"]}
                                            onPress={()=> {
                                                if (this.props.permissions && this.props.permissions['function_6']) {
                                                    this.props.dataSourceSplitted.length > 0 ? this._confirmPark.open() : this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                                                } else {
                                                    this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col style={styles.buttonReceiptAction}>
                                        {splittedSize > 0 && 
                                        <IconButton
                                            icon={'chevron-double-right'}
                                            price={this.props.intl.messages["app.returnSplitted"]}
                                            onPress={()=> {
                                                let equalSplitted = this.props.dataSource;
                                                {/* let size = equalSplitted.length; */}
                                                equalSplitted.forEach((item, i) => {
                                                    if (item.splitUnits)
                                                        setTimeout(()=> this.props.cloneDataSource(1, item, this.fullName, this.splittedName));
                                                    {/* if (i+1 === size) {
                                                        let reduceEqualSplitted = equalSplitted.slice(0, -1);
                                                        this.props.updateSplitEqual(reduceEqualSplitted);
                                                    } */}
                                                });
                                            }}
                                        />
                                        }
                                    </Col>
                                </Row>
                            </Col>

                            <Col size={6}>
                                {this.getButtons()}
                            </Col>

                            <Col size={10}>
                                <Row size={1}>
                                    <Text style={styles.splitReceiptsHead}>{this.getReceptTitle(this.props.intl.messages["app.splittedReceipt"])}</Text>     
                                </Row>
                                <Row size={16} style={{paddingBottom: scale(20)}}>
                                    <ReceiptView ref={elt => this._receiptSplitted = elt}
                                        dataSource={this.props.dataSourceSplitted}
                                        intl={this.props.intl}
                                        getActions={this.getActions}
                                        name={this.splittedName}
                                        getTotalWithDiscount={this.props.getTotalWithDiscount}
                                        discount={this.props.discount}
                                        />
                                </Row>
                                <Row size={3} style={{marginLeft: scale(-5), marginRight: scale(-5)}}>
                                    <Col></Col>
                                    <Col style={styles.buttonReceiptAction}>
                                        <ButtonItem text={this.props.intl.messages["app.cancelUpper"]} style={[styles.declineSplitBtn]} onPress={()=> {
                                            this.setState({open: false});    
                                        }}/>
                                    </Col>
                                    <Col style={styles.buttonReceiptAction}>
                                        <ButtonItem text={this.props.intl.messages["app.pay"]} style={[styles.confirmSplitBtn]} onPress={()=>{
                                            if (this.props.permissions && this.props.permissions['function_8']) {
                                                this.props.dataSourceSplitted.length > 0 ? this._splitPayment.open() : this._alert.open(this.props.intl.messages["app.emptyReceipt"]);
                                            } else {
                                                this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                            }
                                        }}/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>

                <Payment ref={elt => this._splitPayment = elt} total={this.props.getTotalWithDiscount(this.props.dataSourceSplitted)} intl={this.props.intl}
                         onOk={(payments) => {
                             let products_for_scanner = this.props.dataSourceSplitted.filter(line => {
                                 return (['type_4', 'type_5'].indexOf(line.product_type) > -1);
                             });
                             this.props.closeTicket(payments, this.splittedName)
                        }}/>
            
                <NumberPopup ref={elt => this._splitUnit = elt} postfix="X" lockZero
                            alert={text => this._alert.open(text)}
                            onOk={this.splitUnit} intl={this.props.intl} readOnly arrow="left"/>

                <NumberPopup ref={elt => this._splitReceipt = elt} postfix="X" lockZero
                            alert={text => this._alert.open(text)}
                            onOk={(input) => {
                                this.props.splitEqual(input, this.state.dataSource);
                            }} intl={this.props.intl} readOnly arrow="left"/>

                <AlertPopup ref={elt => this._alert = elt} intl={this.props.intl}/>

                <ActionConfirm ref={elt => this._confirmPark = elt} intl={this.props.intl}
                               onOk={()=> this.props.parkTicket(this.splittedName)} explicitClosing>
                    <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                            {this.props.intl !== undefined && this.props.intl.messages["app.parkSplittedReceipt"].toUpperCase()}</Text></Row>
                </ActionConfirm>
            </Modal>
        )
    }
}

class ReceiptView extends Component {
    constructor(props) {
        super(props);
        this.updateDataList = this.updateDataList.bind(this);
    }

    updateDataList(dataSource, scroll) {
        if (!!this._listView && scroll)
            setTimeout(() => this._listView.scrollToEnd({animated: true}));
    }

    render() {
        let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
        let dataSource = ds.cloneWithRows(this.props.dataSource);
        return (
            <View style={[styles.splitReceipt, {paddingTop: scale(20)}]}>
                    <Col>
                        <Row size={2}>
                            <SectionHeader intl={this.props.intl}/>
                        </Row>
                        <Row size={16}>
                            {(!!dataSource && dataSource.getRowCount() > 0) &&
                            <Col>
                                <ListView ref={elt => this._listView = elt}
                                    dataSource={dataSource} enableEmptySections={true}
                                    renderRow={(data) => <ListViewRow {...data}
                                        intl={this.props.intl}
                                        disabled={true}
                                        onPress={(px, py, width, height) => {
                                            if (this.props.name !== undefined) {
                                                this.props.getActions(this.props.name, px, py, data, width, height);
                                            }
                                        }}/>}
                                />
                            </Col>
                            }
                        </Row>
                        <Row size={3}>
                            {(!!dataSource && dataSource.getRowCount() > 0) &&
                            <ReceiptTotals total={this.props.getTotalWithDiscount(this.props.dataSource)}
                                intl={this.props.intl}
                                discount={this.props.discount}/>
                            }
                        </Row>
                    </Col>
            </View>
        )
    }
}