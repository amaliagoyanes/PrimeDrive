import axios from 'axios';
import {AsyncStorage} from 'react-native';
import firestack, {urlBase} from '../fbconfig';


export function createCashBookEntry(text, amount, economicCredentials, economic_account, start_date, end_date) {
    console.log('economic start');
    var soap = require('soap-everywhere');
    var url = 'https://api.e-conomic.com/secure/api1/EconomicWebService.asmx?WSDL';
    var args = {
        Handle: {Id1: 1, Id2: 1}, Id1: 1, Id2: 1, Type: 'FinanceVoucher', CashBookHandle: {Number: 1},
        // DebtorHandle: {Number: '1'}, DebtorInvoiceNumber: 1,
        // CreditorHandle: {Number: '1'}, CreditorInvoiceNumber: '1',
        AccountHandle: {Number: parseInt(economic_account) || 1},
        // VatAccountHandle: {VatCode: '23'}, ContraVatAccountHandle: {VatCode: '23'}
        ContraAccountHandle: {Number: parseInt(economic_account) || 1}, Date: end_date, VoucherNumber: 1, Text: text,
        AmountDefaultCurrency: amount, CurrencyHandle: {Code: "DKK"}, Amount: amount,
        // DueDate: moment().format('YYYY-MM-DDThh:mm:ss'),
        // DepartmentHandle: {Number: 1}, DistributionKeyHandle: {Number: 1}, ProjectHandle: {Number: 1},
        // CostTypeHandle: {Number: 1}, BankPaymentTypeHandle: {Number: 1}, CapitaliseHandle: {Number: 1},
        // BankPaymentCreditorId: '1', BankPaymentCreditorInvoiceId: '1',
        StartDate: start_date, EndDate: end_date,
        // EmployeeHandle: {Number: 1},
    };
    soap.createClient(url, function(err, client) {
        client.ConnectWithToken(economicCredentials, function(err, result) {
            console.log('economic connection', result);
            client.CashBookEntry_CreateFromData({data: args}, function(err, result) {
              console.log('economic output', result);
            });
        });
    });
}

export function createCashBookEntryFor(report_name, customer_uid, economicCredentials, period_start, period_end) {
        let url = `${urlBase}/develop/${report_name}`;
        firestack.auth.getToken().then(res => {
            console.log('started receipts ', res.token);
            axios.get(url, {
                params: {customer_uid: customer_uid || '', period_start: period_start.unix(), period_end: period_end.unix()},
                headers: {idtoken: res.token}
            }).then(response => {
                if (response.data) {
                    response.data.forEach(obj => {
                        if (obj.turnover && obj.turnover > 0) {
                            createCashBookEntry(
                                obj.name, parseFloat(obj.turnover),
                                economicCredentials, obj.economic_account,
                                period_start.format('YYYY-MM-DDThh:mm:ss'),
                                period_end.format('YYYY-MM-DDThh:mm:ss'));
                        }
                    });
                }
            }).catch(err => {
                console.log('REQUEST CANCELED OR ERR', err);
            });
        }).catch(err => console.log(err))
}