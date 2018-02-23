import axios from 'axios';
import moment from 'moment';
import React, {Component} from 'react';
import {
    AsyncStorage,
    TouchableOpacity,
    Text,
    View,
    Alert,
    Image,
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Actions} from 'react-native-router-flux';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import SwipeALot from 'react-native-swipe-a-lot';

import * as Terminal from 'react-native-verifone';
import {
    TicketBlock, ActionConfirm, AlertPopup, ButtonItem, TableNameChange,
    toFixedLocale, toFixedLocaleDa, guid, SubProductsModal, OpenPricePopup
} from './index';
import {fetchData, openCashDrawer, fetchLayout, SystemLog} from '../api';
import styles from '../style/styles';
import plainStyles from '../style/plain';
import NumberPopup from './popups/NumberPopup';
import firestack from '../fbconfig.js';
import * as Progress from 'react-native-progress';
import {scale, scaleText} from '../scaling';
import {types} from '../constants.js';

export class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            closeDay: false,
            checkInOut: false,
            products: {},
            campaigns: {},
            schedules: {},
            layouts: {'function_buttons': {}},
            dataSource: [],
            dataSourceSplitted: [],
            dataSourceSplittedEqual: [],
            active: 0,
            pages: {},
            buttons: {},
            pagesRelations: {},
            paymentMethods: {},
            pagesArr: [],
            timestamp: moment().unix(),
            number: 0,
            change: '',
            table: '',
            error: false,
            ticketData: {},
            userData: null,
            loading: {},
            selectedTable: null,
            returnMode: false,
            retrieving: false,
            waiting: null
        };

        this.ticket = '';
        this.ticketSplitted = '';
        this.updating = false;
        this.resetLayout = this.resetLayout.bind(this);
        this.clearDataSource = this.clearDataSource.bind(this);
        this.closeTicket = this.closeTicket.bind(this);
        this.createPayment = this.createPayment.bind(this);
        this.deleteTicket = this.deleteTicket.bind(this);
        this.getData = this.getData.bind(this);
        this.getTicketData = this.getTicketData.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.loadProducts = this.loadProducts.bind(this);
        this.parkTicket = this.parkTicket.bind(this);
        this.updateDataSource = this.updateDataSource.bind(this);
        this.updateTotal = this.updateTotal.bind(this);
        this.saveTicketDiscount = this.saveTicketDiscount.bind(this);
        this.reduceDataSource = this.reduceDataSource.bind(this);
        this.onTableChange = this.onTableChange.bind(this);
        this.returnMode = this.returnMode.bind(this);
        this.pay = this.pay.bind(this);
        this.getCampaignsData = this.getCampaignsData.bind(this);
        this.updateCashShiftListener = this.updateCashShiftListener.bind(this);
        this.getSourcesRef = this.getSourcesRef.bind(this);
        this.updateLineWithSplit = this.updateLineWithSplit.bind(this);
        this.cloneDataSource = this.cloneDataSource.bind(this);
        this.splitEqual = this.splitEqual.bind(this);
        this.deleteLineDiscount = this.deleteLineDiscount.bind(this);
        this.recalculateCampaign = this.recalculateCampaign.bind(this);
    }

    returnMode(state) {
        let mode = state !== undefined ? state : !this.state.returnMode;
        // if (mode) {
        //     this._returnInfo.open();
        //     setTimeout(() => this._returnInfo.close(), 1500)
        // }

        this.setState({
            returnMode: mode
        })
    }

    reduceDataSource(data) {
        if (data) {
            // let amount = data.amount === 1 ? 0 : data.amount - 1;
            // this.updateDataSource(amount, data.uid);
            this.updateDataSource(-1, null, data.product_id);
        }
    }

    updateCashShiftListener() {
        if (!!this._ticketBlock)
            this._ticketBlock.updateListener();
    }

    parkTicket(type) {
        let config = this.getSourcesRef(type);
        if (config.ticket !== '') {
            firestack.database.ref(`/tickets/${config.ticket}`).once('value').then(snapshot => {
                let ticket = snapshot.val();
                if (!!ticket && ticket.status !== 'parked') {
                    firestack.database.ref(`/tickets/${config.ticket}`).update({
                        status: 'parked'
                    }).then((snapshot) => {
                        SystemLog(this.props.customer_uid, {
                            id: config.ticket,
                            key: 'ticket',
                            message: `The ticket ${config.ticket}-${(this.state.table || '№' + this.state.number)} has been parked`,
                            type: 'add'
                        });
                        this.clearDataSource(type);
                        this.props.getReceipts('parked');
                        firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).once('value').then(snapshot => {
                            let val = snapshot.val();
                            let parked = val.parked || 0;
                            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).update({parked: parked + 1})
                                .then(() => {
                                    setTimeout(() => this._ticketBlock.updateListener(parked + 1), 200);
                                }).catch();
                        }).catch();
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    ticket.ticket_lines = this.state.dataSource;
                    this.clearDataSource(type);
                    this.props.updateParkedReceipts(ticket);
                }
            }).catch();
        }
    }

    saveTicketDiscount(discount) {
        firestack.database.ref(`/tickets/${this.ticket}`).update({discount: discount}).then(result => {
            SystemLog(this.props.customer_uid, {
                name: discount,
                id: this.ticket,
                key: 'discount',
                message: `Discount ${discount}% has been set on the ticket ${this.ticket} - ${(this.state.table || '№' + this.state.number)}`,
                type: 'add'
            });
        });
    }

    getTicketData(ticket) {
        if (!ticket) return;
        let state = {};
        this.ticket = ticket.uid;
        if (ticket.number !== undefined) {
            state.ticketData = {discount: ticket.discount};
            state.number = ticket.number;
            state.table = ticket.table;
            state.retrieving = true;
            this.setState(state, () => console.log('updated table state'));
        }
        if (!!ticket.ticket_lines && typeof ticket.ticket_lines === 'object') {
            let lines = Object.keys(ticket.ticket_lines).map(key => {
                return {...ticket.ticket_lines[key], uid: key}
            });
            console.log('retrieved lines, updating ticket block');
            state.dataSource = lines;
            if (this._ticketBlock !== undefined)
                this._ticketBlock.updateDataList(state.dataSource, true);
        }
        this.setState(state, () => this.recalculateCampaign());
    }

    getCampaignsData(product_uid, displayNext = false) {
        let product = this.state.products[product_uid];
        let campaigns = product.campaigns;

        if (campaigns !== undefined && campaigns !== null && typeof campaigns === 'object') {
            let storage = [];
            Object.keys(campaigns).map(campaign => {
                if (typeof campaigns[campaign] === 'boolean' && !!this.state.campaigns && !!this.state.campaigns[campaign] && this.state.campaigns[campaign].status === true)
                    storage.push({...this.state.campaigns[campaign], uid: campaign});
            });
            let data = storage.reduce((obj, campaign) => {
                let campProduct = campaign.products[product_uid] || {};
                let amount = campProduct.campaign_amount > 0 ? campProduct.campaign_amount : (campaign.general_amount) ? campaign.general_amount : 0;
                let type = campProduct.campaign_type || campaign.general_type;
                let schedule, appliable = true;
                if (!!campaign.schedule) {
                    schedule = this.state.schedules[campaign.schedule];
                    appliable = moment(schedule.end_date, 'DD-MM-YYYY HH:mm').unix() >= moment().unix();
                    if (!!schedule.happy_hours && typeof schedule.happy_hours === 'object' && !!schedule.happy_hours.start_time) {
                        let currDay = `${parseInt(moment().format('E') - 1)}`;
                        let currTime = parseInt(moment().format('HHmm'));
                        let startTime = parseInt(schedule.happy_hours.start_time.replace(':', ''));
                        let endTime = parseInt(schedule.happy_hours.end_time.replace(':', ''));
                        let inTimeRange = (startTime <= currTime) && (currTime <= endTime);
                        appliable = appliable && inTimeRange && schedule.happy_hours.days.split(',').indexOf(currDay) !== -1;
                    }
                }
                if (obj.amount === undefined || (type === 'price' && (parseFloat(obj.amount) > parseFloat(amount))) ||
                    (type === 'discount' && (parseFloat(obj.amount) < parseFloat(amount)))) {
                    obj.type = type;
                    obj.amount = amount;
                    obj.name = campaign.name;
                    obj.uid = campaign.uid;
                    obj.group_by_amount = campaign.group_by_amount;
                    obj.min_amount = campaign.minimal_amount;
                    obj.show_price = campaign.show_price;
                }
                if (!!campaign.minimal_amount) {
                    let affectedProducts = Object.keys(campaign.products);
                    obj.products = affectedProducts;
                    let addedProducts = 0;
                    this.state.dataSource.forEach(product => {
                        if (affectedProducts.indexOf(product.product_id) !== -1)
                            addedProducts += product.units;
                    });
                    let minimal_amount = parseInt(campaign.minimal_amount);
                    if (appliable) {
                        if (displayNext) {
                            if (!(!!campaign.group_by_amount) && addedProducts + 1 >= minimal_amount)
                                return obj;
                            else if (!!campaign.group_by_amount && (addedProducts + 1) % minimal_amount === 0)
                                return obj
                        }
                        if (!displayNext) {
                            if (addedProducts >= minimal_amount)
                                return obj;
                        }
                    }
                } else {
                    if (appliable)
                        return obj;
                }
            }, {});
            // console.log(data);
            return data;
        }
    }

    getSourcesRef(type) {
        let config = {};
        switch (type) {
            case 'splitted':
                config = {
                    name: 'dataSourceSplitted',
                    dataSource: this.state.dataSourceSplitted,
                    setTicket: (id) => this.ticketSplitted = id,
                    ticket: this.ticketSplitted,
                    _ticketBlock_second: this._ticketBlock._splitPayment._receiptSplitted,
                    clearSource: {
                        dataSourceSplitted: []
                    }
                };
                break;
            default:
                config = {
                    name: 'dataSource',
                    dataSource: this.state.dataSource,
                    setTicket: (id) => this.ticket = id,
                    ticket: this.ticket,
                    _ticketBlock: this._ticketBlock,
                    _ticketBlock_second: this._ticketBlock._splitPayment._receiptFull,
                    clearSource: {
                        dataSource: [],
                        userData: {},
                        ticketData: {},
                        selectedTable: null,
                        table: '', number: 0
                    }
                }
                break;
        }
        return config;
    }

    splitEqual(amount, data) {
        if (amount !== undefined) {
            let dataSource = this.state.dataSource || data;
            // let dataSourceEqual = Array.apply(null, {length: amount}).map((d, j) => {
            //     return dataSource.map((item, i) => {
            //         item.splitRatio = (item.splitUnits || item.units) / amount;
            //         if (!item.splitUnits)
            //             item.splitUnits = item.units;
            //         item.units = amount;
            //         return item;
            //     });
            // });
            dataSource.map((item, i) => {
                this.updateLineWithSplit(amount, dataSource[i].uid);
            });
            this.setState({
                dataSource: dataSource,
                // dataSourceSplittedEqual: dataSourceEqual
            });
        }
    }

    updateLineWithSplit(amount, uid, type) {
        let config = this.getSourcesRef(type);
        let dataSource = config.dataSource;
        if (uid) {
            let line = {};
            dataSource.forEach(item => {
                if (item.uid === uid) {
                    let isBeenSplitted = Number(item.units * item.splitRatio);
                    if (!!isBeenSplitted && isBeenSplitted !== item.splitUnits) {
                        console.log('some unit already been splitted and moved out of the product');
                        return;
                    }
                    item.splitRatio = (item.splitUnits || item.units) / amount;
                    if (!item.splitUnits)
                        item.splitUnits = item.units;
                    item.units = amount;
                    line = item;
                }
            });
            firestack.database.ref(`/ticketLines/${uid}`).set(line).then((snapshot) => {
                this.setState({[config.name]: dataSource}, () => {
                    config._ticketBlock.updateDataList();
                    this.updateTotal(type);
                });
            }).catch(err => console.log(err));
        }
    }

    cloneDataSource(amount, data, from, to) {
        let configFrom = this.getSourcesRef(from);
        let configTo = this.getSourcesRef(to);

        if (amount && typeof data === 'object') {
            let dataSourceFrom = this.state[configFrom.name];
            let dataSourceTo = this.state[configTo.name];
            let timestamp = moment().unix();
            let clonedUid = dataSourceTo.find(item => {
                if (item.cloned_uid === data.uid)
                    return true;
                else if (item.uid === data.cloned_uid)
                    return true;
                else
                    return false;
            });

            // removing/reducing from the full datasource
            if (data.units <= amount) {
                dataSourceFrom = dataSourceFrom.filter(item => item.uid !== data.uid);
                if (configFrom._ticketBlock)
                    configFrom._ticketBlock.updateDataList(dataSourceFrom);

                this.setState({[configFrom.name]: dataSourceFrom});
                firestack.database.ref(`/ticketLines/${data.uid}`).remove(error => {
                    console.log(error);
                });
            } else {
                let line = {};
                dataSourceFrom.map(item => {
                    if (data.uid === item.uid) {
                        item.units -= amount;
                        line = item;
                    }
                    return item;
                });
                this.setState({[configFrom.name]: dataSourceFrom});
                firestack.database.ref(`/ticketLines/${data.uid}`).set(line).then((snapshot) => {
                    console.log('line has been updated');
                }).catch(err => console.log(err));
            }

            // if there is the same uid on line
            if (clonedUid && (!data.splitRatio || data.splitRatio === clonedUid.splitRatio)) {
                let line = {};
                dataSourceTo.forEach(item => {
                    if (item.cloned_uid === data.uid || item.uid === data.cloned_uid) {
                        item.units += amount;
                        line = item;
                    }
                });
                firestack.database.ref(`/ticketLines/${clonedUid.uid}`).set(line).then((snapshot) => {
                    this.setState({[configTo.name]: dataSourceTo}, () => {
                        if (configTo._ticketBlock)
                            configTo._ticketBlock.updateDataList(dataSourceTo, true);
                        this.updateTotal(to);
                    });
                }).catch(err => console.log(err));
            } else {
                function addLines(callback) {
                    let line_uid = guid();
                    let line = {
                        uid: line_uid,
                        cash_shift_id: this.props.cash_shift_id,
                        customer_uid: this.props.customer_uid,
                        customer_timestamp: `${this.props.customer_uid}~${timestamp}`,
                        dealer_uid: this.props.dealer_uid,
                        dealer_timestamp: `${this.props.dealer_uid}~${timestamp}`,
                        timestamp: timestamp,
                        cloned_uid: data.uid,
                        units: amount
                    };
                    let cloneData = Object.assign({}, data);
                    Object.keys(line).forEach((key, index) => {
                        cloneData[key] = line[key];
                    });
                    callback(cloneData);
                }

                if (dataSourceTo.length === 0 && !this.updating) {
                    this.updating = true;
                    AsyncStorage.getItem('@PrimeDrive:last_ticket_number').then(number => {
                        number = parseInt(number);
                        number++;
                        let ticket = {
                            client_id: this.props.client_id,
                            department_id: this.props.departmentId,
                            cash_shift_id: this.props.cash_shift_id,
                            customer_uid: this.props.customer_uid,
                            customer_timestamp: `${this.props.customer_uid}~${timestamp}`,
                            dealer_uid: this.props.dealer_uid,
                            dealer_timestamp: `${this.props.dealer_uid}~${timestamp}`,
                            timestamp: timestamp,
                            user_id: this.props.user_uid,
                            number: number,
                            table: '',
                            customer_name: '',
                            customerId: '',
                            total: 0,
                            discount: 0
                        };
                        let ticket_uid = guid();
                        console.log('CREATED', ticket_uid);
                        configTo.setTicket(ticket_uid);
                        firestack.database.ref(`/tickets/${ticket_uid}`).set(ticket).then((snapshot) => {
                            addLines.call(this, (data) => {
                                dataSourceTo.push(data);
                                this.setState({
                                    [configTo.name]: dataSourceTo,
                                    timestamp: timestamp,
                                    number: number
                                }, () => {
                                    if (configTo._ticketBlock)
                                        configTo._ticketBlock.updateDataList();
                                    configTo._ticketBlock_second.updateDataList(dataSourceFrom, true);
                                    this.updating = false;
                                    this.updateTotal(to);
                                });
                                firestack.database.ref(`/ticketLines/${data.uid}`).set(data).then((snapshot) => {
                                }).catch(err => {
                                    console.log(err);
                                });
                            });
                            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).update({last_ticket_number: number}).then().catch();
                            AsyncStorage.setItem('@PrimeDrive:last_ticket_number', String(number)).then().catch();
                        }).catch(err => console.log(err));
                    });
                } else {
                    addLines.call(this, (data) => {
                        dataSourceTo.push(data);
                        firestack.database.ref(`/ticketLines/${data.uid}`).set(data).then((snapshot) => {
                            this.setState({[configTo.name]: dataSourceTo}, () => {
                                if (configTo._ticketBlock)
                                    configTo._ticketBlock.updateDataList();
                                configTo._ticketBlock_second.updateDataList(dataSourceFrom, true);
                                this.updateTotal(to);
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                    })
                }
            }
        }
    }

    deleteLineDiscount(uid) {
        let dataSource = this.state.dataSource;
        dataSource = dataSource.filter(item => {
            let res = item.uid !== uid;
            if (item.uid === uid && !item.isDiscount) {
                item.discount = undefined;
                res = true;
            }
            return res;
        });
        this._ticketBlock.updateDataList(dataSource);
        this.setState({dataSource: dataSource}, () => {
            this.updateTotal();
        });
    }

    recalculateCampaign() {
        let amounts = {};
        let dataSource = this.state.dataSource.map((product) => {
            let campaign = this.getCampaignsData(product.product_id);
            if (product.campaign === undefined)
                firestack.database.ref(`/ticketLines/${product.uid}`).update({campaign: campaign});
            product.campaign = campaign;
            if (campaign && !!(campaign.group_by_amount) && !!(campaign.min_amount)) {
                if (amounts[campaign.uid])
                    amounts[campaign.uid] += product.units;
                else
                    amounts[campaign.uid] = product.units;
                if (amounts[campaign.uid] % parseInt(campaign.min_amount) === 0)
                    delete amounts[campaign.uid]
            }
            return product
        });

        let keys = Object.keys(amounts);
        if (keys.length) {
            keys.forEach(key => {
                let products = this.state.dataSource.filter(product => product.campaign !== undefined && product.campaign.uid === key);
                products = products.slice(-amounts[key]);
                products.forEach(product => {
                    product.campaign = undefined;
                    firestack.database.ref(`/ticketLines/${product.uid}/campaign`).remove();
                })
            })
        }
        this._ticketBlock.updateDataList(dataSource, true);
        this.setState({dataSource: dataSource}, () => {
            this.updateTotal();
        });
    }

    updateDataSource(amount, uid, product_uid, note, discount, price = null) {
        let dataSource = this.state.dataSource;
        let product = this.state.products[product_uid];
        let product_price = price !== null ? price : !!product ? product.price : null;

        if (!this.props.user_uid) {
            this._warning.open();
            return;
        }
        if (this.props.transaction)
            return;

        if (uid === null) {
            let campaign = this.getCampaignsData(product_uid);
            let timestamp = moment().unix();
            // let number = 1000000000 + parseInt(Math.random() * 10000000000);
            if (dataSource.length === 0) {
                AsyncStorage.getItem('@PrimeDrive:last_ticket_number').then(number => {
                    number = parseInt(number);
                    number++;
                    let ticket = {
                        client_id: this.props.client_id,
                        cash_shift_id: this.props.cash_shift_id,
                        customer_uid: this.props.customer_uid,
                        customer_timestamp: `${this.props.customer_uid}~${timestamp}`,
                        dealer_uid: this.props.dealer_uid,
                        dealer_timestamp: `${this.props.dealer_uid}~${timestamp}`,
                        timestamp: timestamp,
                        user_id: this.props.user_uid,
                        number: number,
                        table: '',
                        customer_name: '',
                        customerId: '',
                        total: 0,
                        discount: 0
                    };
                    let ticket_uid = guid();

                    console.log('CREATED', ticket_uid);
                    firestack.database.ref(`/tickets/${ticket_uid}`).set(ticket)
                        .then((snapshot) => {
                            this.ticket = ticket_uid;
                            let line_uid = guid();
                            let data = {
                                uid: line_uid,
                                cash_shift_id: this.props.cash_shift_id,
                                customer_uid: this.props.customer_uid,
                                customer_timestamp: `${this.props.customer_uid}~${timestamp}`,
                                dealer_uid: this.props.dealer_uid,
                                dealer_timestamp: `${this.props.dealer_uid}~${timestamp}`,
                                timestamp: timestamp,
                                name: product.name,
                                units: amount,
                                ticket_id: ticket_uid,
                                note: note,
                                discount: discount,
                                tax_id: '',
                                table: '',
                                product_id: product_uid,
                                product_type: product.product_type,
                                product_coupons: product.coupons,
                                product_price: parseFloat(product_price.replace(',', '.')),
                                campaign: campaign
                            };
                            dataSource.push(data);
                            this._ticketBlock.updateDataList(dataSource, true);

                            SystemLog(this.props.customer_uid, {
                                name: ticket.number,
                                id: ticket_uid,
                                key: 'ticket',
                                type: 'add'
                            });

                            this.setState({dataSource: dataSource, timestamp: timestamp, number: number}, () => {
                                this.updateTotal();
                            });
                            firestack.database.ref(`/ticketLines/${line_uid}`).set(data).then((snapshot) => {
                                SystemLog(this.props.customer_uid, {
                                    id: line_uid,
                                    key: 'ticketLine',
                                    message: `Ticket Line ${line_uid} - ${data.name} has been created on the ticket ${ticket_uid} - ${this.state.table || '№' + this.state.number}`,
                                    type: 'add'
                                });
                            }).catch(err => {
                                console.log(err);
                            });
                            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).update({last_ticket_number: number}).then().catch();
                            AsyncStorage.setItem('@PrimeDrive:last_ticket_number', String(number)).then().catch();
                        }).catch(err => {
                    });
                });
            } else {
                let line_uid = guid();
                let data = {
                    uid: line_uid,
                    cash_shift_id: this.props.cash_shift_id,
                    customer_uid: this.props.customer_uid,
                    customer_timestamp: `${this.props.customer_uid}~${timestamp}`,
                    dealer_uid: this.props.dealer_uid,
                    dealer_timestamp: `${this.props.dealer_uid}~${timestamp}`,
                    timestamp: timestamp,
                    name: product.name,
                    units: amount,
                    ticket_id: this.ticket,
                    note: note,
                    discount: discount,
                    tax_id: '',
                    table: '',
                    product_id: product_uid,
                    product_type: product.product_type,
                    product_coupons: product.coupons,
                    product_price: parseFloat(product_price.replace(',', '.')),
                    campaign: campaign
                };

                dataSource.push(data);
                this._ticketBlock.updateDataList(dataSource, true);
                this.setState({dataSource: dataSource}, () => {
                    this.updateTotal();
                    this.recalculateCampaign();
                    firestack.database.ref(`/ticketLines/${line_uid}`).set(data).then((snapshot) => {
                        SystemLog(this.props.customer_uid, {
                            name: data.name,
                            message: `Ticket Line ${line_uid} - ${data.name} has been created on the ticket ${this.ticket} - ${(this.state.table || '№' + this.state.number)}`,
                            id: line_uid,
                            key: 'ticketLine',
                            type: 'add'
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                });
            }

        } else if (amount === 0) {
            let params = {id: uid, key: 'ticketLine', type: 'remove'};
            dataSource = dataSource.filter(item => {
                if (item.uid === uid)
                    params.name = item.name;
                return item.uid !== uid;
            });
            this._ticketBlock.updateDataList(dataSource);
            this.setState({dataSource: dataSource}, () => {
                this.updateTotal();
                this.recalculateCampaign();
            });
            firestack.database.ref(`/ticketLines/${uid}`).remove(error => {
                SystemLog(this.props.customer_uid, params);
                console.log(error);
            })
        } else {
            let line = {}, discountLine = {}, hasItem = false, pos = 0;
            dataSource.forEach((item, i) => {
                if (item.uid === uid) {
                    item.units = amount;
                    if (!!discount) {
                        discountLine = {...item};
                        discountLine.price = discountLine.product_price;
                        discountLine.product_price = 0;
                        discountLine.isDiscount = true;
                    }
                    if (item.isDiscount === undefined) {
                        line = item;
                        pos = i;
                    } else {
                        discountLine = item;
                        hasItem = true;
                    }
                }
            });
            line.note = note;
            line.discount = !!discount ? discount : undefined;
            if (!!discount) {
                discountLine.note = note;
                discountLine.discount = discount;
                if (!hasItem) {
                    if (pos === dataSource.length)
                        dataSource.push(pos + 1, 0, discountLine);
                    else
                        dataSource.splice(pos + 1, 0, discountLine);
                }
            }
            firestack.database.ref(`/ticketLines/${uid}`).set(line).then((snapshot) => {
                this.setState({dataSource: dataSource}, () => {
                    this._ticketBlock.updateDataList();
                    this.updateTotal();
                    this.recalculateCampaign();
                });
            }).catch(err => console.log(err));
        }
    }

    updateTotal(type) {
        let config = this.getSourcesRef(type);
        let total = 0;
        config.dataSource.forEach(i => {
            if (i.product_price && i.isDiscount === undefined) {
                let splitted = (i.splitUnits > 0) ? i.splitRatio : 1;
                let price = i.product_price * i.units * splitted;
                if (i.discount)
                    price = price * (1 - parseFloat(i.discount.replace(',', '.')) / 100);
                if (i.campaign && i.campaign.type === 'discount' && i.campaign.amount)
                    price = price * (1 - parseFloat(i.campaign.amount.replace(',', '.')) / 100);
                if (i.campaign && i.campaign.type === 'price' && i.campaign.amount)
                    price = parseFloat(i.campaign.amount.replace(',', '.'));
                total += price
            }
        });
        total = total.toFixed(2);
        firestack.database.ref(`/tickets/${config.ticket}`).update({
            total: total
        }).then((snapshot) => {
            SystemLog(this.props.customer_uid, {
                id: config.ticket,
                message: `The total amount has been updated to ${total} on the ticket ${config.ticket} - ${(this.state.table || '№' + this.state.number)}`,
                key: 'ticket',
                type: 'update'
            });
        }).catch(err => {
            console.log(err);
        });
    }

    loadProducts() {
        let dataRelations = [
            {firebaseRoot: 'paymentMethods', name: 'paymentMethods'},
            {firebaseRoot: 'products', name: 'products'},
            {firebaseRoot: 'functionTypes', name: 'functions'},
            {firebaseRoot: 'schedules', name: 'schedules'},
            {firebaseRoot: 'priceList', name: 'campaigns'}
        ];
        let itemsProcessed = 0;
        let state = {};
        dataRelations.forEach((relation, i) => {
            fetchData(relation.firebaseRoot).then(result => {
                state[relation.name] = result;
                itemsProcessed++;
                if (itemsProcessed === dataRelations.length) {
                    this.setState(state);
                }
            }).catch(err => {
                console.log('load products', err);
                this.setState({error: true})
            });
        })
    }

    getData() {
        fetchLayout(this.props.layout).then(state => {
            let pages = Object.keys(state.pages).map(page => {
                return {...state.pages[page], uid: page}
            });
            pages.sort(function (first, second) {
                return first['order'] - second['order'];
            });
            state.pagesArr = pages;
            state.active = state.pagesArr[0].uid;
            this.setState(state);
            this.started = false;
            if (this.state.dataSource.length > 0 && this._ticketBlock !== undefined) {
                this._ticketBlock.updateDataList();
            }
            console.log('setting layout state')
        }).catch(err => {
            console.log(err);
            this.started = false;
            this.setState({error: true})
        });
        this.props.getReceipts('parked');
        this.props.getReceipts('closed');
    }

    closeTicket(payments, dataSource) {
        let config = this.getSourcesRef(dataSource);
        firestack.database.ref(`/tickets/${config.ticket}`).once('value').then(snapshot => {
            let ticket = snapshot.val();
            let isParked = ticket.status === 'parked';

            let timestamp = moment().unix();
            let processed = [];
            let change = parseFloat(ticket.total);
            let totalText = toFixedLocaleDa(parseFloat(ticket.total)) + ' DKK';
            let paymentText = [];
            let showChange = false;
            let ticketPayments = {};
            SystemLog(this.props.customer_uid, {
                name: ticket.table || ticket.number,
                id: this.ticket,
                message: `Ticket ${config.ticket} - ${(ticket.table || ticket.number)} with total amount ${change} has been closed`,
                key: 'ticket',
                type: 'close'
            });
            payments.forEach(payment => {
                if (!!payment.uid) {
                    payment = {...this.state.paymentMethods[payment.uid], ...payment};
                    payment.key = payment.uid;
                }

                this.createPayment(payment, timestamp, dataSource).then((uid) => {
                    processed.push(uid);
                    // let type = payment.payment_type !== undefined ? types[payment.payment_type].name : payment.type;
                    let type = payment.payment_type !== undefined ? payment.type : this.props.intl.messages[`app.${payment.type.toLowerCase()}`];
                    let paymentTotal = payment.total !== undefined ? parseFloat(payment.total) : parseFloat(payment.input);
                    paymentText.push (`${type.toUpperCase()} ${toFixedLocale(paymentTotal)} DKK`);
                    // if (/cash/gi.test(type))
                    showChange = true;
                    ticketPayments[uid] = {
                        type: type, payment_type: payment.payment_type,
                        total: paymentTotal
                    };

                    change = payment.total !== undefined ? change - parseFloat(payment.total) : change - parseFloat(payment.input);
                    if (processed.length === payments.length) {
                        let ticket = config.ticket;
                        this.clearDataSource(dataSource);
                        this._ticketBlock.closeFinished();
                        if (change < 0) {
                            change = Math.abs(change);
                            if (!!this.props.printerType && this.props.printerType !== 'mpop')
                                this.props.openDrawer();
                            else
                                openCashDrawer(null, (text) => this._alert.open(text));
                            change = `${toFixedLocale(change)} DKK`;
                        }
                        if (showChange) {
                            this.setState({change: change, paymentText: paymentText.join('\n'), lastTotal: totalText}, () => {
                                this._change.open();
                            });
                        }
                        if (!!this.props.settings.logout) {
                            this.props.openUserLogin();
                        }
                        if (!!this.props.settings.print_receipt) {
                            this._ticketBlock.printReceipt(false, true);
                        }
                        firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).once('value').then(snapshot => {
                            let val = snapshot.val();
                            let parked = val.parked || 0;
                            if (parked && isParked)
                                parked += -1;
                            let closed = val.closed ? val.closed + 1 : 1;
                            firestack.database.ref(`/tickets/${ticket}`).update({
                                status: 'closed', payments: ticketPayments
                            }).then(response => {
                                this.props.getReceipts('closed');
                            }).catch();
                            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).update({
                                parked: parked,
                                closed: closed
                            }).then().catch();
                        }).catch();
                    }
                }).catch(err => {
                    console.log(err);
                    //this._ticketBlock.closeFinished();
                    processed.forEach(uid => {
                        console.log('removing ', uid);
                        firestack.database.ref(`/payments/${uid}`).remove(error => {
                            console.log(error);
                        });
                    })
                });
            });
        }).catch(err => {
            console.log(err);
            this._ticketBlock.closeFinished();
        });
    }

    async pay(payment, payment_uid, resolve, reject, retry) {
        if (!this.props.connected && this.props.address === '') {
            this._connect.open();
            this.props.setTransaction(false);
            reject();
            return
        }

        this.props.setTransaction(true);
        try {
            console.log('called transaction');
            const result = await Terminal.transaction(Terminal.TransactionType.PURCHASE, parseInt(parseFloat(payment.value * 100)),
                Terminal.Currency.DKK, Terminal.MerchantInitiative.PIN, 0, {});
            firestack.database.ref(`/payments/${payment_uid}`).set(payment)
                .then(response => {
                    this.props.setTransaction(false);
                    SystemLog(this.props.customer_uid, {
                        id: payment_uid,
                        message: `Payment ${payment_uid} with type ${payment.type} and amount ${payment.value} has been made`,
                        key: 'payment',
                        type: 'add'
                    });
                    resolve()
                })
                .catch(err => reject(err));
        } catch (err) {
            if (err.code === '65538' && !retry) {
                if (!this.props.connected && this.props.address !== '') {
                    try {
                        let connected = await this.props.connect();
                        if (!connected) {
                            this.props.setTransaction(false);
                            reject();
                        } else {
                            this.pay(payment, payment_uid, resolve, reject, true)
                        }
                    } catch (err) {
                        this.props.setTransaction(false);
                        this._declined.open();
                        reject();
                    }
                } else {
                    this.pay(payment, payment_uid, resolve, reject, true)
                }
            } else {
                this.props.setTransaction(false);
                this._declined.open();
                reject();
            }
        }
    }

    createPayment(paymentObj, timestamp, type) {
        let config = this.getSourcesRef(type);
        return new Promise((resolve, reject) => {
            let payment_type = paymentObj.payment_type;
            if (payment_type === undefined) {
                if (paymentObj.type === 'card')
                    payment_type = 'type_2';
                else if (paymentObj.type === 'cash')
                    payment_type = 'type_1';
                else {
                    let re = new RegExp(paymentObj.type, 'i');
                    Object.keys(types).forEach(type => {
                        if (re.test(types[type].name))
                            payment_type = type
                    });
                }
            }

            let payment = {
                cash_shift_id: this.props.cash_shift_id,
                customer_uid: this.props.customer_uid,
                customer_timestamp: `${this.props.customer_uid}~${timestamp}`,
                dealer_uid: this.props.dealer_uid,
                dealer_timestamp: `${this.props.dealer_uid}~${timestamp}`,
                ticket_id: config.ticket,
                timestamp: timestamp,
                rate: paymentObj.rate !== undefined ? paymentObj.rate : 1,
                type: paymentObj.type,
                payment_type: payment_type,
                payment_method: paymentObj.key !== undefined ? paymentObj.key : '',
                value: paymentObj.input !== undefined ? paymentObj.input : paymentObj.total,
            };
            let payment_uid = guid();
            console.log('payment', payment_uid);

            if (this.props.settings.verifone_terminal &&
                ((paymentObj.type === 'card' && paymentObj.payment_type === undefined) || paymentObj.verifone_terminal)) {
                this.props.setTransaction(true, () => this.pay(payment, payment_uid, resolve, reject));
            } else {
                firestack.database.ref(`/payments/${payment_uid}`).set(payment)
                    .then(response => {
                        SystemLog(this.props.customer_uid, {
                            id: payment_uid,
                            message: `Payment ${payment_uid} with type ${payment.type} and amount ${payment.value} has been made`,
                            key: 'payment',
                            type: 'add'
                        });
                        resolve(payment_uid)
                    })
                    .catch(err => reject(err));
            }
        })
    }

    clearDataSource(type) {
        let config = this.getSourcesRef(type);
        config.setTicket('');
        this.setState(config.clearSource, () => {
            config._ticketBlock.updateDataList();
            this._ticketBlock.closeFinished();
        });
    }

    deleteTicket() {
        let ticketUid = '' + this.ticket;
        if (ticketUid === '' || ticketUid === undefined)
            return;
        this.clearDataSource();
        firestack.database.ref(`/tickets/${ticketUid}`).once('value').then(snapshot => {
            let ticket = snapshot.val();
            let isParked = /parked/.test(ticket.status);
            this.props.deleteParkedReceipt(ticket);
            firestack.database.ref(`/tickets/${ticketUid}`).remove()
                .then((err) => {
                    if (isParked) {
                        this.props.getReceipts('parked');
                        firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).once('value').then(snapshot => {
                            let val = snapshot.val();
                            let parked = val.parked || 0;
                            firestack.database.ref(`/cashShifts/${this.props.cash_shift_id}`).update({parked: parked - 1})
                                .then(() => {
                                    setTimeout(() => this._ticketBlock.updateListener(parked - 1), 200);
                                }).catch();
                        }).catch();
                    }
                    SystemLog(this.props.customer_uid, {
                        id: this.ticket,
                        name: !!ticket ? ticket.table || ticket.number || '' : '',
                        key: 'ticket',
                        type: 'remove'
                    });
                }).catch(err => {
            });
        }).catch();
    }

    handleValueChange() {
        this.setState({layouts: {'function_buttons': {}}}, () => {
            this.loadProducts();
            this.getData();
        });
    }

    componentDidUpdate(props, state) {
        if ((this.props.uid !== props.uid || this.props.layout !== props.layout || this.props.ticket !== props.ticket)
            && this.props.uid !== undefined && this.props.layout !== undefined && !this.started) {
            if (props.layout && this.props.layout !== props.layout)
                firestack.database.ref(`/layouts/${props.layout}/`).off('value');
            firestack.database.ref(`/layouts/${this.props.layout}/`).on('value', this.handleValueChange);
        }
    }

    componentDidMount() {
        if (this.props.ticket !== undefined && this.props.ticket !== null) {
            this.getTicketData(this.props.ticket);
        }
        if (this.props.uid !== undefined && this.props.layout !== undefined) {
            this.started = true;
            this.loadProducts();
            this.getData();
        }
        // else { this.getTicketData({uid: 'd5af'}); }
    }

    componentWillUnmount() {
        firestack.database.ref(`/layouts/${this.props.layout}/`).off('value')
    }

    onTableChange(table, name) {
        if (name) {
            this.setState({table: name});
            firestack.database.ref(`/tickets/${this.ticket}`).update({table: name}).then();
        }
        else
            this._alert.open(this.props.intl.messages["app.emptyName"])
    }

    resetLayout() {
        try {
            this._ticketBlock.resetButtons();
            this._topButtons.swipeToPage(0);
            this._mainButtons.swipeToPage(0);
            this.setState({active: this.state.pagesArr[0].uid})
        } catch (err) {
            this.setState({error: false}, () => this.componentDidMount());
        }
    }

    onSelectTable(selectedTable) {
        this.setState({selectedTable: selectedTable});
        this._ticketBlock.updateSelectedTable(selectedTable);
        firestack.database.ref(`/tickets/`).orderByChild('table').equalTo(selectedTable.uid).once('timestamp').then((snapshot) => {
            let tickets = snapshot.val();
            if (tickets) {
                tickets = Object.keys(tickets).map(ticket => {
                    return {...tickets[ticket], uid: ticket}
                });
                if (tickets.length) {
                    let openOrParkedTickets = tickets.filter(function (ticket) {
                        return ticket.status === 'open' || ticket.status === 'parked'
                    });
                    if (openOrParkedTickets.length > 0)
                        if (openOrParkedTickets.length === 1)
                            Actions.home({ticket: openOrParkedTickets[0].uid});
                        else if (openOrParkedTickets.length > 1) {
                            this._alert.open('Found ' + openOrParkedTickets.length + ' tickets with table "' + selectedTable.name + '"!');
                        }
                }
            }
        })
    }

    render() {
        let buttons = this.state.pages[this.state.active] ? this.state.pages[this.state.active].buttons : {};
        let grids = 0;
        let skipNext = 0;
        let pages = this.state.pagesArr;

        buttons = Object.keys(buttons).map(button => {
            if (buttons[button].gridNumber > grids)
                grids += 1;
            return {...buttons[button], uid: button}
        });

        let topPagesSize = 3, topPagesRow = 1.75, layoutButtons = 4.25;
        if (pages.length < 7)
            topPagesSize = 2, topPagesRow = 1.15, layoutButtons = 4.85;
        if (pages.length < 4)
            topPagesSize = 1, topPagesRow = 1, layoutButtons = 5;

        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                {this.state.error ?
                    <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                        <Text style={{color: '#fff'}}>
                            <FormattedMessage id="app.networkError"
                                              defaultMessage="Error occurred during loading data from server. Please check your network connection or try again later."/>
                        </Text>
                    </View> :
                    this.state.layouts.name === undefined ?
                        <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1, alignItems: 'center'}}>
                            <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)}
                                             indeterminate={true}/>
                        </View> :
                        <Row>
                            <Col size={6}>
                                <Row size={topPagesRow}>
                                    <SwipeALot circleDefaultStyle={plainStyles.dotStyle}
                                               ref={elt => this._topButtons = elt}
                                               circleActiveStyle={plainStyles.activeDotStyle}>
                                        {Array.apply(null, {length: Math.ceil(pages.length / 9)}).map((d, k) =>
                                            <Col key={k}>
                                                {Array.apply(null, {length: topPagesSize}).map((d, i) =>
                                                    <Row key={i}
                                                         style={i === topPagesSize - 1 ? styles.slide : styles.topSlide}>
                                                        {Array.apply(null, {length: 3}).map((d, j) => {
                                                            let idx = 3 * i + j + 9 * k;
                                                            return idx < pages.length ?
                                                                <ButtonItem text={this.state.pagesArr[idx].name}
                                                                            onPress={() => {
                                                                                this.setState({active: null}, () => {
                                                                                    this.setState({active: pages[idx].uid});
                                                                                })
                                                                            }}
                                                                            active={this.state.active === pages[idx].uid}
                                                                            key={pages[idx].uid}/> :
                                                                <Col key={j}/>
                                                        })}
                                                    </Row>
                                                )}
                                            </Col>
                                        )}
                                    </SwipeALot>
                                </Row>
                                <Row size={layoutButtons}>
                                    {!this.props.cash_shift_id ?
                                        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                                            <Text style={styles.text}>
                                                <FormattedMessage id="app.noShiftWarning"
                                                                  defaultMessage="Please open the day first"/></Text>
                                        </View> :
                                        !!this.state.active ?
                                            <SwipeALot circleDefaultStyle={plainStyles.dotStyle}
                                                       ref={elt => this._mainButtons = elt}
                                                       circleActiveStyle={plainStyles.activeDotStyle}>
                                                {Array.apply(null, {length: grids + 1}).map((d, s) =>
                                                    <View style={styles.slide} key={s}>
                                                        {Array.apply(null, {length: 6}).map((d, i) =>
                                                            <Row key={i}>
                                                                {Array.apply(null, {length: 6}).map((d, j) => {
                                                                    let button = buttons.filter(b => b.gridNumber === s && b.location_x === j && b.location_y === i);
                                                                    if (button.length) {
                                                                        button = button[0];
                                                                        let product = this.state.products[button.product];
                                                                        let style = {};
                                                                        let image;
                                                                        if (button.color !== undefined && button.color !== '')
                                                                            style.backgroundColor = button.color;
                                                                        if (button.width > 1) {
                                                                            skipNext = button.width - 1;
                                                                        }
                                                                        if (button.image !== undefined) {
                                                                            image = Object.keys(button.image).map(image => button.image[image].downloadURL)[0];
                                                                        }
                                                                        let height = '100%';
                                                                        if (button.height > 1)
                                                                            height = `${button.height}00%`;
                                                                        if (product)
                                                                            return (
                                                                                <MenuItem key={j} intl={this.props.intl}
                                                                                          text={product.name}
                                                                                          height={height}
                                                                                          image={image}
                                                                                          style={style}
                                                                                          size={button.width}
                                                                                          price={`${product.price} DKK`}
                                                                                          campaign={!!product.campaigns ? this.getCampaignsData(button.product, true) : null}
                                                                                          onPress={(px, py) => {
                                                                                              if (this.props.permissions && this.props.permissions['function_5']) {
                                                                                                  if (product.sub_products && Object.keys(product.sub_products).length)
                                                                                                      if (this.state.returnMode)
                                                                                                          this._subProductsModal.open(
                                                                                                              this.state.products, product.sub_products,
                                                                                                              (product) => {
                                                                                                                  this.updateDataSource(-1, null, product);
                                                                                                                  this.returnMode(false);
                                                                                                              });
                                                                                                      else
                                                                                                          this._subProductsModal.open(this.state.products, product.sub_products);
                                                                                                  else if (this.state.returnMode)
                                                                                                      this._confirmReturn.openWithParams(1, null, button);
                                                                                                  else if (product.product_type === 'type_3')
                                                                                                      this._openPrice.open(px, py, button.product, '');
                                                                                                  else
                                                                                                      this.updateDataSource(1, null, button.product)
                                                                                              } else {
                                                                                                  this._alert.open(this.props.intl.messages["app.missingPermissions"]);
                                                                                              }
                                                                                          }}
                                                                                          onLongPress={(px, py) => {
                                                                                              let mode = this.state.returnMode;
                                                                                              if (product.sub_products && Object.keys(product.sub_products).length)
                                                                                                  this._subProductsModal.open(
                                                                                                      this.state.products, product.sub_products,
                                                                                                      (product) => {
                                                                                                          this._ticketLine.open(px, py, product, mode)
                                                                                                      });
                                                                                              else
                                                                                                  this._ticketLine.open(px, py, button.product, mode);
                                                                                              this.returnMode(false);
                                                                                          }}/>
                                                                            )
                                                                    } else {
                                                                        if (skipNext > 0) {
                                                                            skipNext -= 1;
                                                                        } else {
                                                                            return <Col key={j}/>
                                                                        }
                                                                    }
                                                                })
                                                                }
                                                            </Row>
                                                        )}
                                                    </View>
                                                )}
                                            </SwipeALot> :
                                            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}/>
                                    }
                                </Row>
                            </Col>
                            <Col size={4}>
                                <TicketBlock ref={elt => this._ticketBlock = elt} port={this.props.port}
                                             functions={this.state.layouts['function_buttons']}
                                             paymentButtons={this.state.layouts['payment_buttons']}
                                             dataSource={this.state.dataSource} intl={this.props.intl}
                                             dataSourceSplitted={this.state.dataSourceSplitted}
                                             dataSourceSplittedEqual={this.state.dataSourceSplittedEqual}
                                             timestamp={this.state.timestamp} table={this.state.table}
                                             number={this.state.number} shouldUpdate={this.props.shouldUpdate}
                                             transaction={this.props.transaction} paying={this.state.paying}
                                             abort={() => this.props.setTransaction(false)}
                                             printerType={this.props.printerType} print={this.props.print}
                                             openDrawer={this.props.openDrawer}
                                             deleteItem={(uid, isDiscount) => {
                                                 if (isDiscount) this.deleteLineDiscount(uid);
                                                 else this.updateDataSource(0, uid);
                                             }}
                                             updateCashShiftListener={this.props.updateCashShiftListener}
                                             openParkedReceipts={this.props.openParkedReceipts}
                                             openClosedReceipts={this.props.openClosedReceipts}
                                             toggleReturnMode={this.returnMode} returnMode={this.state.returnMode}
                                             updateNumber={() => this._receiptNumberChange.open()}
                                             openUserLogin={this.props.openUserLogin}
                                             openModal={this.props.openModal}
                                             cash_shift_id={this.props.cash_shift_id}
                                             departmentId={this.props.departmentId}
                                             userData={this.state.userData} ticketData={this.state.ticketData}
                                             onPress={() => this.setState({visible: true})}
                                             parkTicket={this.parkTicket}
                                             dispatch={this.props.dispatch} retrieving={this.state.retrieving}
                                             saveTicketDiscount={this.saveTicketDiscount}
                                             reduceDataSource={this.reduceDataSource}
                                             clearDataSource={() => this.setState({
                                                 dataSource: [],
                                                 userData: {},
                                                 ticketData: {},
                                                 table: ''
                                             }, () => this._ticketBlock.updateDataList())}
                                             deleteTicket={this.deleteTicket} closeTicket={this.closeTicket}
                                             selectTable={(selectedTable) => {
                                                 this.onSelectTable(selectedTable)
                                             }}
                                             selectedTable={this.state.selectedTable}
                                             onOk={this.updateDataSource}
                                             updateLineWithSplit={this.updateLineWithSplit}
                                             cloneDataSource={this.cloneDataSource}
                                             splitEqual={this.splitEqual}
                                             updateSplitEqual={(data) => {
                                                 this.setState({dataSourceSplittedEqual: data});
                                             }}
                                             permissions={this.props.permissions}/>
                            </Col>
                            <NumberPopup ref={elt => this._ticketLine = elt} postfix="X" showDelimiter deleteAll
                                         alert={text => this._alert.open(text)}
                                         onOk={this.updateDataSource} intl={this.props.intl} readOnly arrow="left"/>

                            <OpenPricePopup ref={elt => this._openPrice = elt} postfix="DKK" showDelimiter deleteAll
                                            alert={text => this._alert.open(text)}
                                            onOk={this.updateDataSource} intl={this.props.intl} readOnly arrow="left"/>

                            <ActionConfirm ref={elt => this._change = elt} intl={this.props.intl} onlyOkButton
                                           onOk={() => this.setState({change: ''})}>
                                <Row style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                                    <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                                        {`${this.props.intl.messages["app.approved"]}\n`}
                                    </Text>
                                    <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                                        {`${this.state.paymentText}`}
                                    </Text>
                                    <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                                        {!!this.state.change && this.props.intl !== undefined && this.props.intl.messages["app.change"]}
                                        {!!this.state.change && ` ${this.state.change}`}
                                    </Text>
                                </Row>
                            </ActionConfirm>
                            <ActionConfirm ref={elt => this._declined = elt} intl={this.props.intl} onlyOkButton
                                           onOk={() => this.setState({change: ''})}>
                                <Row style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                                    <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                                        {`${this.props.intl.messages["app.declined"]}\n`}
                                    </Text>
                                </Row>
                            </ActionConfirm>
                            <ActionConfirm ref={elt => this._warning = elt} intl={this.props.intl}
                                           onOk={this.props.openUserLogin}>
                                <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.notLoggedIn"]}
                                    </Text></Row>
                            </ActionConfirm>
                            <ActionConfirm ref={elt => this._connect = elt} intl={this.props.intl}
                                           onOk={() => this.props.openModal('terminalStatus')}>
                                <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.notConnected"]}
                                    </Text></Row>
                            </ActionConfirm>
                            <ActionConfirm ref={elt => this._confirmReturn = elt} intl={this.props.intl}
                                           onOk={(data) => {
                                               this.updateDataSource(-1, null, data.product);
                                               this.returnMode(false);
                                           }}>
                                <Row style={{justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={{fontSize: scaleText(14), color: '#313138', textAlign: 'center'}}>
                                        {this.props.intl !== undefined && this.props.intl.messages["app.returnProduct"].toUpperCase()}</Text></Row>
                            </ActionConfirm>
                            <AlertPopup ref={elt => this._alert = elt} intl={this.props.intl}/>
                            <TableNameChange ref={elt => this._receiptNumberChange = elt} intl={this.props.intl}
                                             message="app.changeTicketTable" value={this.state.table}
                                             onOk={this.onTableChange}/>
                            <SubProductsModal ref={elt => this._subProductsModal = elt} intl={this.props.intl}
                                              onPress={this.updateDataSource}/>
                        </Row>
                }
            </View>
        )
    }
}

export default Layout
// export default connect(({app}) => ({
//     uid: app.uid, layout: app.layout, client_id: app.client_id, departmentId: app.departmentId,
//     user_uid: app.user_uid, customer_uid: app.customer_uid, dealer_uid: app.dealer_uid
// }), undefined, undefined, {withRef: true})(Layout)


export class MenuItem extends React.Component {
    onPress(isLong) {
        this._line.measure((fx, fy, width, height, px, py) => {
            try {
                if (!!isLong)
                    this.props.onLongPress(px + width, py);
                else
                    this.props.onPress(px + width, py);
            } catch (err) {
                console.log(err)
            }
        });
    }

    render() {
        let props = this.props;
        let price = parseFloat(props.price.replace(',', '.'));
        if (!!props.campaign) {
            if (props.campaign.type === 'discount')
                price = toFixedLocaleDa(price - price * (parseFloat(props.campaign.amount.replace(',', '.')) / 100));
            else if (props.campaign.type === 'price')
                price = toFixedLocaleDa(props.campaign.amount.replace(',', '.'));
        }

        return (
            <Col size={props.size ? props.size : 1} style={{height: props.height}}>
                <TouchableOpacity onLongPress={() => this.onPress(true)} ref={elt => this._line = elt}
                                  onPressIn={() => {
                                      this.lastTimePress = new Date().getTime();
                                  }}
                                  onPressOut={() => {
                                      let diff = new Date().getTime() - this.lastTimePress;
                                      if (diff < 500 && this.props.onPress) {
                                          this.onPress();
                                      }
                                  }}
                                  style={[styles.button, styles.activeColor, props.style]}>
                    {props.image !== undefined &&
                    <Image source={{uri: props.image}} style={[styles.imageOnButton]}></Image>
                    }
                    {props.text !== undefined &&
                    <Text style={[styles.text, {fontSize: scaleText(13.5), textAlign: 'center'}]}>
                        {props.text.toUpperCase()}</Text>}
                    {props.price !== undefined && price === null &&
                    <Text style={[styles.text, {fontSize: scaleText(12.5), textAlign: 'center'}]}>
                        {props.price.toUpperCase()}</Text>}
                    {props.price !== undefined && price !== null &&
                    <Text style={[styles.text, {fontSize: scaleText(12.5), textAlign: 'center'}]}>
                        {`${price}`} DKK</Text>}
                </TouchableOpacity>
            </Col>
        );
    }
}
