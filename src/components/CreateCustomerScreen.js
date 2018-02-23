import React, {Component} from 'react';
import {
    TouchableOpacity,
    Text,
    Alert,
    Image,
    View
} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {Col, Row, Grid} from 'react-native-easy-grid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Sae} from 'react-native-textinput-effects';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import SelectMultiple from 'react-native-select-multiple';
import ImagePicker from 'react-native-image-picker';
import firestack from '../fbconfig.js'
import imageUpload from '../imageUpload.js'

import {ButtonItem, guid4, AlertPopup} from './index';
import styles from '../style/styles';
import {scale, scaleText} from '../scaling';
import ReceiptListViewRow from "./plain/ReceiptListViewRow";

class CreateCustomerScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '', lastName: '', address: '', city: '', zipcode: '', accountNumber: '', mail: '',
            phone: '', notes: '', customerGroups: [], groups: [], uid: '', imageURL: '', customerCreated: false,
            accountName: '', accountCardID: '', accountCardType: '', accountVoucher: '', accountTypes: [],
            accountType: [], accountCredit: '', accountBalance: ''
        };

        this.okOnPress = this.okOnPress.bind(this);
        this.getGroups = this.getGroups.bind(this);
        this.onSelectionsChange = this.onSelectionsChange.bind(this);
        this.pickImage = this.pickImage.bind(this);
        this.createCustomer = this.createCustomer.bind(this);
        this.createCustomerAccount = this.createCustomerAccount.bind(this);
        this.onAccountTypeChange = this.onAccountTypeChange.bind(this);
    }

    componentDidMount() {
        this.getGroups();
        this.getAccountTypes();
        this.setState({uid: guid4() + guid4() + '-' + guid4() + guid4() + guid4()});
    }

    getGroups() {
        firestack.database.ref(`/customerGroups/`).once("value").then((snapshot) => {
            let groups = snapshot.val();
            groups = Object.keys(groups).map(group => {
                return {label: groups[group].name, value: group}
            });
            this.setState({groups: groups})
        })
    }

    getAccountTypes() {
        firestack.database.ref(`/customerAccountsType/`).once("value").then((snapshot) => {
            let types = snapshot.val();
            types = Object.keys(types).map(type => {
                return {label: types[type].name, value: type}
            });
            this.setState({accountTypes: types})
        })
    }

    createCustomer() {
        if (!this.state.firstName.length) {
            this._firstName.focus()
        } else if (!this.state.lastName.length) {
            this._lastName.focus()
        } else if (!this.state.accountNumber.length) {
            this._accountNumber.focus()
        }
        else {
            let groups = {};
            this.state.customerGroups.forEach(function (group) {
                groups[group.value] = true;
            });
            let customer = {
                name: this.state.firstName + ' ' + this.state.lastName,
                address: this.state.address,
                city: this.state.city,
                zipcode: this.state.zipcode,
                accountNumber: this.state.accountNumber,
                mail: this.state.mail,
                phone: this.state.phone,
                notes: this.state.notes,
                groups: groups,
                image: this.state.imageURL
            };
            firestack.database.ref(`/customers/${this.state.uid}`).set(customer).then((snapshot) => {
                this.setState({customerCreated: true})
            }).catch((err) => {
                console.log('Error', err)
            });
        }
    }

    createCustomerAccount() {
        if (!this.state.accountName.length) {
            this._accountName.focus()
        }else if (!this.state.accountCardID.length) {
            this._accountCardID.focus()
        } else if (!this.state.accountCardType.length) {
            this._accountCardType.focus()
        } else if (!this.state.accountCredit.length) {
            this._accountCredit.focus()
        }else if (!this.state.accountBalance.length) {
            this._accountBalance.focus()
        }else if (!this.state.accountType.length) {
            this._alert.open('Please select account type!')
        } else {
            let account = {
                name: this.state.accountName,
                voucher_code: this.state.address,
                active: true,
                credit: this.state.accountCredit,
                balance: this.state.accountBalance,
                card_id: this.state.accountCardID,
                card_type: this.state.accountCardType,
                customer_id: this.state.uid,
                account_type: this.state.accountType[0].value
            };
            let accountUid = guid4() + guid4() + guid4() + guid4() + guid4();
            firestack.database.ref(`/customerAccounts/${accountUid}`).set(account).then((snapshot) => {
                this._alert.open('Success');
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    okOnPress() {
        if (!this.state.customerCreated) this.createCustomer();
        else this.createCustomerAccount();
    }

    onSelectionsChange(customerGroups) {
        this.setState({customerGroups})
    };

    onAccountTypeChange(accountType) {
        {/* hack: there's no good component for select dropdown */}
        if (accountType.length > 1) {
            this.setState({accountType: accountType.slice(1)})
        }
        else this.setState({accountType})
    };

    pickImage() {
        this.setState({imageURL: ''});

        ImagePicker.launchImageLibrary({}, response => {
            imageUpload(response.uri, this.state.uid, '/customers/images')
                .then(url => this.setState({imageURL: url}))
                .catch(error => console.log(error))
        })
    }

    render() {
        let header = {
            height: scale(40),
            alignSelf: 'stretch',
        };

        return (
            <Grid style={[styles.container, {paddingLeft: scale(30), paddingTop: scale(25)}]}>
                <Row size={0.5} style={header}>
                    <Col size={2}>
                        <Text style={{color: "white", marginTop: 5}}>
                            <FormattedMessage id="app.createCustomer" defaultMessage="Create Customer"/></Text>
                    </Col>
                    <Col size={10}/>
                    <Col size={1}>
                        <TouchableOpacity onPress={() => Actions.pop()}
                                          style={[styles.timesIcon, {marginTop: 0, backgroundColor: '#53535a'}]}>
                            <Icon size={scaleText(18)} name="close" color="white"/>
                        </TouchableOpacity>

                    </Col>
                </Row>
                {!this.state.customerCreated ?
                <Row size={6}>
                    <Col>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Sae
                                    label={'First Name'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._firstName = el}
                                    onChangeText={(text) => {
                                        this.setState({firstName: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                            <Col/>
                            <Col size={2}>
                                <Sae
                                    label={'Last Name'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._lastName = el}
                                    onChangeText={(text) => {
                                        this.setState({lastName: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Sae
                                    label={'Address'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._address = el}
                                    onChangeText={(text) => {
                                        this.setState({address: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                            <Col/>
                            <Col size={2}>
                                <Sae
                                    label={'City'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._city = el}
                                    onChangeText={(text) => {
                                        this.setState({city: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Sae
                                    label={'Zipcode'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._zipcode = el}
                                    onChangeText={(text) => {
                                        this.setState({zipcode: text})
                                    }}
                                    keyboardType="numeric"
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                            <Col/>
                            <Col size={2}>
                                <Sae
                                    label={'Account Number'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._accountNumber = el}
                                    onChangeText={(text) => {
                                        this.setState({accountNumber: text})
                                    }}
                                    keyboardType="numeric"
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Sae
                                    label={'Mail'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._mail = el}
                                    onChangeText={(text) => {
                                        this.setState({mail: text})
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize={'none'}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                            <Col/>
                            <Col size={2}>
                                <Sae
                                    label={'Phone'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._phone = el}
                                    onChangeText={(text) => {
                                        this.setState({phone: text})
                                    }}
                                    keyboardType="phone-pad"
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col>
                                <Sae
                                    label={'Notes'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._notes = el}
                                    onChangeText={(text) => {
                                        this.setState({notes: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col>
                                <Row size={1}>
                                    <Text style={[styles.text, {
                                        backgroundColor: 'transparent',
                                        fontFamily: 'Gotham-Bold',
                                        color: '#7771ab',
                                        fontSize: scaleText(18)
                                    }]}><FormattedMessage id="app.groups" defaultMessage="Groups" /></Text>
                                </Row>
                                <Row size={3}>
                                    <SelectMultiple
                                        items={this.state.groups}
                                        selectedItems={this.state.customerGroups}
                                        onSelectionsChange={this.onSelectionsChange}
                                        labelStyle={[styles.text, {color: '#7771ab'}]}
                                        rowStyle={{backgroundColor: 'transparent', borderBottomWidth: 0, padding: 0}}
                                    />
                                </Row>
                            </Col>
                        </Row>
                        <Row size={0.5} style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col style={{paddingLeft: scale(200), paddingRight: scale(200)}}>
                                <ButtonItem text="app.okUpper" onPress={this.okOnPress}
                                            style={[styles.button, {backgroundColor: '#2dab61'}]}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>: <View/>
                }
                {this.state.customerCreated ?
                <Row size={6}>
                    <Col>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Sae
                                    label={'Name'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._accountName = el}
                                    onChangeText={(text) => {
                                        this.setState({accountName: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                            <Col/>
                            <Col size={2}>
                                <Sae
                                    label={'Voucher Code'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._accountVoucher = el}
                                    onChangeText={(text) => {
                                        this.setState({accountVoucher: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Sae
                                    label={'Card ID'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._accountCardID = el}
                                    onChangeText={(text) => {
                                        this.setState({accountCardID: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                            <Col/>
                            <Col size={2}>
                                <Sae
                                    label={'Card Type'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._accountCardType = el}
                                    onChangeText={(text) => {
                                        this.setState({accountCardType: text})
                                    }}
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Sae
                                    label={'Credit'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._accountCredit = el}
                                    onChangeText={(text) => {
                                        this.setState({accountCredit: text})
                                    }}
                                    keyboardType="numeric"
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                            <Col/>
                            <Col size={2}>
                                <Sae
                                    label={'Balance'}
                                    iconClass={FontAwesomeIcon}
                                    iconName={'pencil'}
                                    iconColor={'white'}
                                    autoCorrect={false}
                                    style={{height: scale(16)}}
                                    ref={el => this._accountBalance = el}
                                    onChangeText={(text) => {
                                        this.setState({accountBalance: text})
                                    }}
                                    keyboardType="numeric"
                                    labelStyle={{fontFamily: 'Gotham-Bold'}}
                                />
                            </Col>
                        </Row>
                        <Row style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col size={2}>
                                <Row size={1}>
                                    <Text style={[styles.text, {
                                        backgroundColor: 'transparent',
                                        fontFamily: 'Gotham-Bold',
                                        color: '#7771ab',
                                        fontSize: scaleText(18)
                                    }]}><FormattedMessage id="app.accountType" defaultMessage="Account Type" /></Text>
                                </Row>
                                <Row size={3}>
                                    <SelectMultiple
                                        items={this.state.accountTypes}
                                        selectedItems={this.state.accountType}
                                        onSelectionsChange={this.onAccountTypeChange}
                                        labelStyle={[styles.text, {color: '#7771ab'}]}
                                        rowStyle={{
                                            backgroundColor: 'transparent',
                                            borderBottomWidth: 0,
                                            padding: 0
                                        }}
                                    />
                                </Row>
                            </Col>
                            <Col/>
                            <Col size={2}/>
                        </Row>
                        <Row size={0.5} style={{paddingLeft: scale(100), paddingRight: scale(100)}}>
                            <Col style={{paddingLeft: scale(200), paddingRight: scale(200)}}>
                                <ButtonItem text="app.okUpper" onPress={this.okOnPress}
                                            style={[styles.button, {backgroundColor: '#2dab61'}]}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>: <View/>
                }
                <Row size={1}/>
                <AlertPopup ref={elt => this._alert = elt} intl={this.props.intl}/>
            </Grid>
        )
    }
}

export default connect(({app}) => ({
    departmentId: app.departmentId,
}))(CreateCustomerScreen)