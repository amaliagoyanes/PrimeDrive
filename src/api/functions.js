import axios from 'axios';
import {AsyncStorage} from 'react-native';
import firestack, {urlBase} from '../fbconfig';
import store from '../reducers';
import {updateAuthToken} from '../reducers/actions';
import {guid} from '../components/index';
import moment from 'moment';


export function fetchData(tableName, params = {}) {
    return new Promise(function (resolve, reject) {
        let url = `${urlBase}/develop/get-list`;
        // AsyncStorage.getItem('@PrimeDrive:token').then(token => {
        //     axios.get(url, {
        //         params: {customer_uid: '', table_name: tableName, ...params},
        //         headers: {idtoken: token},
        //     }).then(response => {
        //         resolve(response.data);
        //     }).catch(err => {
        firestack.auth.getToken()
            .then(res => {
                console.log('started ', tableName)
                axios.get(url, {
                    params: {customer_uid: '', table_name: tableName, ...params},
                    headers: {idtoken: res.token},
                }).then(response => {
                    console.log('ended ', tableName)
                    resolve(response.data);
                    AsyncStorage.setItem('@PrimeDrive:token', JSON.stringify(res.token)).then(() =>
                        store.dispatch(updateAuthToken({token: res.token}))
                    );
                }).catch(err => reject(err));
            })
            .catch(err => reject(err))
    })
    //     })
    // })
}

export function fetchReceipts(tableName, params = {}, cancelToken) {
    return new Promise(function (resolve, reject) {
        let url = `${urlBase}/develop/get-receipts`;
        firestack.auth.getToken()
            .then(res => {
                console.log('started receipts ');
                axios.get(url, {
                    params: {customer_uid: '', ...params},
                    headers: {idtoken: res.token},
                    cancelToken: cancelToken
                }).then(response => {
                    console.log('ended receipts ');
                    resolve(response.data);
                    AsyncStorage.setItem('@PrimeDrive:token', JSON.stringify(res.token)).then(() =>
                        store.dispatch(updateAuthToken({token: res.token}))
                    );
                }).catch(err => {
                    console.log('REQUEST CANCELED OR ERR', err);
                    reject(err);
                });
            })
            .catch(err => reject(err))
    })
}

export function fetchTicketLines(ticket) {
    return new Promise(function (resolve, reject) {
        console.log('started storage data retrieval');
        let url = `${urlBase}/develop/get-ticket-lines`;
        firestack.auth.getToken()
            .then(res => {
                axios.get(url, {
                    params: {object_uid: ticket, table_name: 'ticketLines'},
                    headers: {idtoken: res.token},
                }).then(response => {
                    resolve(response.data);
                    AsyncStorage.setItem('@PrimeDrive:token', JSON.stringify(res.token)).then(() =>
                        store.dispatch(updateAuthToken({token: res.token}))
                    );
                }).catch(err => reject(err));
            })
            .catch(err => reject(err))
    })
}

export function fetchReport(cash_shift, type='tsp') {
    return new Promise(function (resolve, reject) {
        console.log('started report data retrieval');
        let url = `${urlBase}/develop/reports/${type}`;
        firestack.auth.getToken()
            .then(res => {
                axios.get(url, {
                    params: {cash_shift_id: cash_shift, type: 'json', customer_uid: ''},
                    headers: {idtoken: res.token},
                }).then(response => {
                    resolve(response.data);
                    AsyncStorage.setItem('@PrimeDrive:token', JSON.stringify(res.token)).then(() =>
                        store.dispatch(updateAuthToken({token: res.token}))
                    );
                }).catch(err => reject(err));
            })
            .catch(err => reject(err))
    })
}

export function fetchLayout(uid) {
    return new Promise(function (resolve, reject) {
        let url = `${urlBase}/develop/get-layout`;
        firestack.auth.getToken()
            .then(res => {
                axios.get(url, {
                    params: {object_uid: uid},
                    headers: {idtoken: res.token},
                }).then(response => {
                    let state = processResponse(response.data);
                    resolve(state);
                    AsyncStorage.setItem('@PrimeDrive:token', JSON.stringify(res.token)).then(() =>
                        store.dispatch(updateAuthToken({token: res.token}))
                    );
                }).catch(err3 => {
                    reject(err3)
                });
            })
            .catch(err2 => {
                reject(err2)
            })
    });
}

function processResponse(data) {
    let state = {};
    let defaultPageNumber = 0;

    let pages = data.pages;
    state['pages'] = pages || {};
    if (pages)
        state.active = Object.keys(pages)[0];
    state['buttons'] = {};
    state['pagesRelations'] = {};

    if (data && pages) {
        Object.keys(pages).map((page, pageIndex) => {
            if (typeof state.pagesRelations[page] !== 'object')
                state.pagesRelations[page] = {};
            if (typeof state.pagesRelations[page] !== 'object')
                state.pagesRelations[page] = {};

            // iterate through each button pf the page
            Object.keys(pages[page].buttons).map((button, buttonIndex) => {
                state.pagesRelations[page][buttonIndex] = button;

                if (pageIndex === defaultPageNumber) {
                    state.buttons[buttonIndex] = pages[page].buttons[button];
                }
            });

            // set default buttons
            if (pageIndex === defaultPageNumber) {
                state.currentPage = page;
            }
        });
    }

    state['layouts'] = data;
    state['loading'] = false;
    return state
}


function padToTwo(numberString) {
    if (numberString.length < 2) {
        numberString = '0' + numberString;
    }
    return numberString;
}

export function hexAverage() {
    let args = Array.prototype.slice.call(arguments);
    return args.reduce(function (previousValue, currentValue) {
        return currentValue
            .replace(/^#/, '')
            .match(/.{2}/g)
            .map(function (value, index) {
                return previousValue[index] + parseInt(value, 16);
            });
    }, [0, 0, 0])
        .reduce(function (previousValue, currentValue) {
            return previousValue + padToTwo(Math.floor(currentValue / args.length).toString(16));
        }, '#');
}

export function SystemLog(uid, params) {
    if (uid === undefined && params === undefined)
        return;
    let data = {};
    let date = moment().format('YYYY-MM-DD H:mm');
    let message = '';
    let name = '';
    let messages = {
        ticket: {name: 'Ticket'},
        ticketLine: {name: 'Ticket line'},
        payment: {name: 'Payment'},
        default: {name: ''}
    };
    let selected = params.key ? messages[params.key] ? messages[params.key] : '' : messages.default;

    if (params.name)
        name = `'${params.name}'`;
    else if (params.id)
        name = `'${params.id}'`;
    else 
        return;

    if (!params.message)
        switch (params.type) {
            case 'add':
                message = `${selected.name} ${name} has been created`;
                break;
            case 'remove':
                message = `${selected.name} ${name} has been removed`;
                break;
            case 'update':
                message = `${selected.name} ${name} has been updated`;
                break;
            default:
                message = '';
        }

    data = {
        user: uid,
        customer_uid: uid,
        date: date,
        log: 'log_1',
        message: message,
        ...params
    };

    // console.log('system uid ', uid);
    // console.log('system data ', data);

    let id = guid();
    let url = `userLogs/${id}`;
    firestack.database.ref(url).set(data)
        .then((snapshot) => {
            console.log('log updated');
        }).catch(err => {
    });
}