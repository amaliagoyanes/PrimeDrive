import React from 'react';
import StarIo from 'react-native-star-io';
import {Alert, AsyncStorage, Platform} from 'react-native';
import {toFixedLocale, toFixedLocaleDa} from '../components/plain/receipts/plainComponents';
import store from '../reducers';
import {updatePrinterPort} from '../reducers/actions';

export function getPrinterStatus() {
    return new Promise(function (resolve, reject) {
        if (Platform.OS === 'ios') {
            reject('Not implemented');
            return
        }
        StarIo.searchPrinter()
            .then(resp => {
                if (resp.length > 0) {
                    let printer = resp[0];
                    StarIo.getPortStatus(printer.port).then(status => {
                        // Alert.alert(this.props.intl.messages["app.statusInfo"], `Status: ${JSON.stringify(status)}\nSearch res: ${JSON.stringify(resp)}`);
                        resolve(`Status: ${JSON.stringify(status)}\nSearch res: ${JSON.stringify(resp)}`);
                    }).catch(err => {
                        reject(err);
                    })
                } else {
                    reject('No printers found');
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function printReceipt(data, isSummary, port, callback, alert) {
    if (Platform.OS === 'ios') {
        return
    }
    // data.total = toFixedLocaleDa(data.total);
    if (data.discount !== undefined && !isSummary)
        data.discount.value = toFixedLocaleDa(data.discount.value);
    if (data.number !== undefined)
        data.number = data.number.toString();

    if (port === null || port === undefined || port === '') {
        console.log('running search for print');
        StarIo.searchAndOpenPort().then((response) => {
            if (!response.length) {
                isSummary ? StarIo.createSummary(JSON.stringify(data)).then().catch() :
                    StarIo.createData(JSON.stringify(data)).then().catch();
                if (!!alert)
                    alert('No nearby printers found.');
                if (callback !== undefined) callback();
            } else {
                store.dispatch(updatePrinterPort(response[0].port));
                isSummary ? printSummary(null, data, callback, alert) : printMessage(null, data, callback, alert);
            }
        }).catch(err => {
            if (!!alert)
                alert('No printers found.');
            if (callback !== undefined) callback();
        })
    } else {
        console.log('running receipt printing');
        isSummary ? printSummary(null, data, callback, alert) : printMessage(null, data, callback, alert);
    }
}

function printMessage(port, data, callback, alert) {
    StarIo.printMessage(port, JSON.stringify(data)).then(status => {
        // resolve(status);
        if (callback !== undefined) callback();
    }).catch(err => {
        if (callback !== undefined) callback();
        if (!!alert)
            alert('Receipt could not be printed. Please check port status')
        // AsyncStorage.removeItem('@PrimeDrive:printerPort').then(() => printReceipt(data));
    })
}

function printSummary(port, data, callback, alert) {
    StarIo.printSummary(port, JSON.stringify(data)).then(status => {
        if (callback !== undefined) callback();
    }).catch(err => {
        if (callback !== undefined) callback();
        if (!!alert)
            alert('Receipt could not be printed. Please check port status')
        // AsyncStorage.removeItem('@PrimeDrive:printerPort').then(() => printReceipt(data));
    })
}


export function testReceipt(data, isSummary) {
    if (Platform.OS === 'ios') {
        return
    }
    data.total = toFixedLocaleDa(data.total);
    if (data.discount !== undefined && !isSummary)
        data.discount.value = toFixedLocaleDa(data.discount.value);

    isSummary ? StarIo.createSummary(JSON.stringify(data)).then().catch() :
        StarIo.createData(JSON.stringify(data)).then().catch();
}

export function openCashDrawer(port, alert) {
    if (Platform.OS === 'ios') {
        console.log('Not implemented');
        return
    }

    if (port === null || port === undefined || port === '') {
        StarIo.searchAndOpenPort().then((response) => {
            if (!response.length) {
                if (!!alert)
                    alert('No nearby printers found.');
            } else {
                store.dispatch(updatePrinterPort(response[0].port));
                StarIo.openCashDrawer(response[0].port).then()
                    .catch(err => {
                        if (!!alert)
                            alert('Cash Drawer could not be opened')
                    })
            }
        // }).catch(err => {
        //     Alert.alert('Error', 'No printers found.');
        })
    } else {
        StarIo.openCashDrawer(null).then()
            .catch(err => {
                if (!!alert)
                    alert('Cash Drawer could not be opened')
            })
    }
}

