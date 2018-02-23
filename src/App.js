import 'intl';
import 'intl/locale-data/jsonp/en';
import React, {Component} from 'react';
import {AppState, Platform, Text} from 'react-native';
import {IntlProvider} from 'react-intl-redux';
import Immersive from 'react-native-immersive';
// import codePush from "react-native-code-push";

import StarIo from 'react-native-star-io';
import {MainScreen, ReceiptsScreen, Login, TableManagement, CreateCustomerScreen, CustomersScreen, UserLoginScreen} from './components';
import {Router, Scene} from 'react-native-router-flux'
import {connect, Provider} from 'react-redux';

const RouterWithRedux = connect()(Router);
import store from './reducers';
import {addLocaleData} from 'react-intl';
import da from 'react-intl/locale-data/da';
addLocaleData([...da]);


class PrimeDrive extends Component {
    componentDidMount() {
        if (Platform.OS !== 'ios') {
            Immersive.on();
            Immersive.setImmersive(true);
            AppState.addEventListener('change', this._handleAppStateChange);
        }
    }

    _handleAppStateChange(nextAppState) {
        if (nextAppState === 'active') {
            Immersive.on();
            Immersive.setImmersive(true);
        }
        if (nextAppState.match(/inactive|background/)) {
            StarIo.closePort();
            console.log('called close port?')
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    render() {
        return (
            <Provider store={store}>
                <IntlProvider textComponent={Text}>
                    <RouterWithRedux hideNavBar={true}>
                        <Scene key="root" hideNavBar={true}>
                            <Scene key="home" component={MainScreen}/>
                            <Scene key="login" component={Login}/>
                            <Scene key="userLogin" component={UserLoginScreen}/>
                            <Scene key="receipts" component={ReceiptsScreen}/>
                            <Scene key="tableManagement" component={TableManagement}/>
                            <Scene key="customersScreen" component={CustomersScreen} />
                            <Scene key="createCustomerScreen" component={CreateCustomerScreen}/>
                        </Scene>
                    </RouterWithRedux>
                </IntlProvider>
            </Provider>
        )
    }
}

// const codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME, updateDialog: true, installMode: codePush.InstallMode.IMMEDIATE };
// export default codePush(codePushOptions)(PrimeDrive);
export default PrimeDrive;
