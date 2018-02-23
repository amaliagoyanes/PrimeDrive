export const AUTH_CHANGED = 'AUTH_CHANGED';
export const TOKEN_CHANGED = 'TOKEN_CHANGED';
export const PORT_CHANGED = 'PORT_CHANGED';
export const ADDRESS_CHANGED = 'ADDRESS_CHANGED';
export const ESC_ADDRESS_CHANGED = 'ESC_ADDRESS_CHANGED';
export const TYPE_CHANGED = 'TYPE_CHANGED';
export const CONNECTION_TYPE_CHANGED = 'CONNECTION_TYPE_CHANGED';
export const SHIFT_CHANGED = 'SHIFT_CHANGED';
export const SETTINGS_CHANGED = 'SETTINGS_CHANGED';
export const UID_CHANGED = 'UID_CHANGED';
export const PERMISSIONS_CHANGED = 'PERMISSIONS_CHANGED';
export const SHIFT_UPDATE_CHANGED = 'SHIFT_UPDATE_CHANGED';
export const UPDATE_CLOSED_RECEIPTS = 'UPDATE_CLOSED_RECEIPTS';
export const UPDATE_PARKED_RECEIPTS = 'UPDATE_PARKED_RECEIPTS';
export const UPDATE_CURRENT_RECEIPT = 'UPDATE_CURRENT_RECEIPT';
export const UPDATE_USER_NUMBER = 'UPDATE_USER_NUMBER';

export function updateAuthToken(token) {
    return {
        type: TOKEN_CHANGED,
        token
    }
}

export function updatePrinterPort(port) {
    return {
        type: PORT_CHANGED,
        port
    }
}

export function updatePrinterAddress(printerAddress) {
    return {
        type: ADDRESS_CHANGED,
        printerAddress
    }
}

export function updateESCPrinterAddress(escPrinterAddress) {
    return {
        type: ESC_ADDRESS_CHANGED,
        escPrinterAddress
    }
}

export function updatePrinterConnectionType(isUSB) {
    return {
        type: CONNECTION_TYPE_CHANGED,
        isUSB
    }
}

export function updatePrinterType(printerType) {
    return {
        type: TYPE_CHANGED,
        printerType
    }
}

export function updateUserAuth(auth) {
    return {
        type: AUTH_CHANGED,
        auth
    }
}

export function updateUserNumber(number) {
    return {
        type: UPDATE_USER_NUMBER,
        number
    }
}

export function updateCashShift(cash_shift) {
    return {
        type: SHIFT_CHANGED,
        cash_shift
    }
}

export function updateCashShiftListener(shouldUpdate) {
    return {
        type: SHIFT_UPDATE_CHANGED,
        shouldUpdate
    }
}

export function updateUserUID(user_uid) {
    return {
        type: UID_CHANGED,
        user_uid
    }
}

export function updateSettings(settings) {
    return {
        type: SETTINGS_CHANGED,
        settings
    }
}

export function updatePermissions(permissions) {
    return {
        type: PERMISSIONS_CHANGED,
        permissions
    }
}

export function updateClosedReceipts(closed_receipts) {
    return {
        type: UPDATE_CLOSED_RECEIPTS,
        closed_receipts
    }
}

export function updateParkedReceipts(parked_receipts) {
    return {
        type: UPDATE_PARKED_RECEIPTS,
        parked_receipts
    }
}

export function updateCurrentReceipt(current_receipt) {
    return {
        type: UPDATE_CURRENT_RECEIPT,
        current_receipt
    }
}
