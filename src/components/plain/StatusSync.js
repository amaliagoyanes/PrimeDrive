import React from 'react';
import {
    AsyncStorage,
    TouchableOpacity,
    Text,
    View, NetInfo
} from 'react-native';
import firestack from '../../fbconfig.js'
import styles from '../../style/styles';
import {scale, scaleText} from '../../scaling';

export default class StatusSync extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            status: true, number: undefined, client: undefined
        };

        this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
    }

    componentDidUpdate(props, state){
        // if (props.user_uid !== this.props.user_uid)
        //     AsyncStorage.getItem('@PrimeDrive:user_info')
        //         .then(info => {
        //             info = JSON.parse(info);
        //             if (info)
        //                 this.setState({number: info.number});
        //             else
        //                 this.setState({number: ''});
        //         })
        //         .catch(err => console.log(err));
    }

    handleConnectivityChange(isConnected) {
        this.setState({status: isConnected});
    }

    componentDidMount(){
        AsyncStorage.getItem('@PrimeDrive:user_info')
            .then(info => {
                info = JSON.parse(info);
                this.setState({client: this.props.client_name, number: info !== null ? info.number : ''})
            })
            .catch(err => console.log(err));
        NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({status: isConnected})
        });
        NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
    }

    componentWillUnmount(){
        NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
    }

    render() {
        let version = '1.0.0';
        let statusText = '';
        // if (this.state.number)
        //     statusText = this.state.number + ' - ';
        if (this.props.userNumber)
            statusText += ' - ';
        if (this.props.client_name)
            statusText += this.props.client_name + ' - ';
        statusText += `V${version}`;

        let styleCircle = {
            borderRadius: scale(7),
            width: scale(14),
            height: scale(14),
            marginRight: 5
        };

        return (
            <TouchableOpacity style={{
                justifyContent: 'center', 
                alignItems: 'center', 
                flexDirection: 'row',
                height: scale(30)
            }} onPress={this.props.forceSync}>
                <View style={{...styleCircle, backgroundColor: this.state.status ? 'green' : 'yellow'}} />
                <Text style={styles.text}>{this.props.userNumber} {statusText}</Text>
            </TouchableOpacity>
        );
    }
}