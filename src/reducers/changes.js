import {
    AUTH_CHANGED, TOKEN_CHANGED, SHIFT_CHANGED, SETTINGS_CHANGED, PORT_CHANGED, ADDRESS_CHANGED, ESC_ADDRESS_CHANGED,
    TYPE_CHANGED, CONNECTION_TYPE_CHANGED, UID_CHANGED, PERMISSIONS_CHANGED, SHIFT_UPDATE_CHANGED,
    UPDATE_CLOSED_RECEIPTS, UPDATE_PARKED_RECEIPTS, UPDATE_CURRENT_RECEIPT, UPDATE_USER_NUMBER
} from './actions.js'

export function appReducer(state = {
    uid: '', token: '', userNumber: '', port: '', printerAddress: '', printerType: '', escPrinterAddress: '', isUSB: false, shouldUpdate: false,
    cash_shift: '', settings: {}, permissions: {}
}, action) {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case AUTH_CHANGED:
            newState = {...action.auth};
            return newState;
        case TOKEN_CHANGED:
            newState.token = action.token;
            return newState;
        case PORT_CHANGED:
            newState.port = action.port;
            return newState;
        case ADDRESS_CHANGED:
            newState.printerAddress = action.printerAddress;
            return newState;
        case ESC_ADDRESS_CHANGED:
            newState.escPrinterAddress = action.escPrinterAddress;
            return newState;
        case CONNECTION_TYPE_CHANGED:
            newState.isUSB = action.isUSB;
            return newState;
        case TYPE_CHANGED:
            newState.printerType = action.printerType;
            return newState;
        case SHIFT_CHANGED:
            newState.cash_shift = action.cash_shift;
            return newState;
        case UID_CHANGED:
            newState.user_uid = action.user_uid;
            return newState;
        case UPDATE_USER_NUMBER:
            newState.userNumber = action.number;
            return newState;
        case SETTINGS_CHANGED:
            newState.settings = action.settings;
            return newState;
        case PERMISSIONS_CHANGED:
            newState.permissions = action.permissions;
            return newState;
        case SHIFT_UPDATE_CHANGED:
            newState.shouldUpdate = action.shouldUpdate;
            return newState;
        default:
            return state;
    }
}

export function receiptReducer(state = {parked_receipts: null, closed_receipts: null, current_receipt: {}}, action) {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case UPDATE_CLOSED_RECEIPTS:
            newState.closed_receipts = action.closed_receipts;
            return newState;
        case UPDATE_PARKED_RECEIPTS:
            newState.parked_receipts = action.parked_receipts;
            return newState;
        case UPDATE_CURRENT_RECEIPT:
            newState.current_receipt = action.current_receipt;
            return newState;
        default:
            return state;
    }
}
