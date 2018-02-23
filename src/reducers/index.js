import { combineReducers } from 'redux';
import {intlReducer, updateIntl} from 'react-intl-redux';
import {AsyncStorage} from 'react-native';
import routes from './routes';
import {appReducer, receiptReducer} from './changes';
import { createStore, applyMiddleware, compose } from 'redux';
import * as messages from '../translations/locales/en.json'
import * as daMessages from '../translations/locales/da.json'

const reducers = combineReducers({
    routes,
    app: appReducer,
    receipts: receiptReducer,
    intl: intlReducer
});

const middleware = [/* ...your middleware (i.e. thunk) */];
const store = compose(
    applyMiddleware(...middleware)
)(createStore)(reducers);

AsyncStorage.getItem('@PrimeDrive:last_lang').then(lang => {
    if (lang && lang === 'da') {
        store.dispatch(updateIntl({locale: 'da', messages: daMessages}));
    } else {
        store.dispatch(updateIntl({locale: 'en', messages: messages}));
    }
}).catch(() => {
    store.dispatch(updateIntl({locale: 'en', messages: messages}));
});

export default store;