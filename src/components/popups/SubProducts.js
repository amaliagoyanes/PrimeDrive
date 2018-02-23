import React, {Component} from 'react';
import {
    Dimensions,
    TouchableOpacity,
    Text, FlatList,
    View,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import SwipeALot from 'react-native-swipe-a-lot';
import Modal from 'react-native-root-modal';
import * as Progress from 'react-native-progress';

import {ButtonItem, IconButton, ModalHeader, ModalCloseButton} from '../index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {fetchData} from '../../api';
import styles from '../../style/styles';
import plainStyles from '../../style/plain';
import {scale, scaleText} from '../../scaling';


export default class SubProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, loaded: false, products: [], groups: [], active: '', search: '', sub_products: [],
        };
        this.modalName = 'SUB PRODUCTS';

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.getItems = this.getItems.bind(this);
        this.loadData = this.loadData.bind(this);
        this.setActive = this.setActive.bind(this);
    }

    setActive(key) {
        this.setState({active: key, sub_products: []});
    }

    loadData() {
        let dataRelations = [
            {firebaseRoot: 'products', 'name': 'products'},
            {firebaseRoot: 'productsGroups', 'name': 'groups'},
        ];
        let itemsProcessed = 0;
        let state = {};
        dataRelations.forEach((relation, i) => {
            fetchData(relation.firebaseRoot).then(result => {
                result = Object.keys(result).map(key => {
                    return {...result[key], key: key};
                });
                state[relation.name] = result;
                itemsProcessed++;
                if (itemsProcessed === dataRelations.length) {
                    state.loaded = true;
                    try {
                        state.active = state.groups[0].key;
                    } catch (err) {
                    }
                    this.setState(state);
                }
            }).catch(err => {
                console.log('load products', err);
                this.setState({error: true})
            });
        })
    }

    open() {
        this.setState({open: true}, () => {
            if (!this.state.groups.length) {
                this.loadData();
            }
        })
    }

    close() {
        this.setState({open: false, groups: [], products: [], loaded: false, sub_products: []})
    }

    getItems() {
        let products = this.state.products;
        if (this.state.search !== '')
            products = products.filter((obj) => {
                return obj.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1 || obj.number.toString().indexOf(this.state.search) !== -1
            });

        if (this.state.sub_products.length) {
            products = products.filter((obj) => {
                return this.state.sub_products.indexOf(obj.key) !== -1;
            });
        } else if (this.state.active !== '') {
            products = products.filter((obj) => {
                return obj.product_group === this.state.active;
            });
        }


        let perRow = 4,
            rows = 4,
            perSlide = 16,
            slides = Math.ceil(products.length / perSlide);
        if (products.length === 0) {
            return <Col><Text style={styles.textDark}>{this.props.intl.messages['app.noGroupProducts']}</Text></Col>
        }
        return (
            <SwipeALot circleDefaultStyle={{...plainStyles.dotStyleModal}}
                       circleActiveStyle={plainStyles.activeDotStyleModal}>
                {Array.apply(null, {length: slides}).map((d, idxSld) =>
                    <Col style={[styles.slide, {marginBottom: 0}]} key={idxSld}>
                        {Array.apply(null, {length: rows}).map((d, idxRow) =>
                            <Row key={idxRow}>
                                {Array.apply(null, {length: perRow}).map((d, idxItem) => {
                                    let item = products[idxSld * (perSlide - 1) + idxRow * rows + idxItem];
                                    if (item) {
                                        return <IconButton key={item.key} intl={this.props.intl}
                                                           text={item.name} active={item.sub_products === undefined}
                                                           price={`${item.price} DKK`}
                                                           onPress={() => {
                                                               let sub_products = item.sub_products;
                                                               if (sub_products !== undefined) {
                                                                   sub_products = Object.keys(item.sub_products).map(key => key);
                                                                   this.setState({sub_products: sub_products});
                                                               }
                                                           }}
                                        />
                                    } else {
                                        return <Col key={idxItem}/>
                                    }
                                })}
                            </Row>
                        )}
                        <Row size={0.1}/>
                    </Col>
                )}
            </SwipeALot>
        )
    }

    render() {
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: Dimensions.get('screen').height * 0.1,
                        left: Dimensions.get('screen').width * 0.1,
                        width: Dimensions.get('screen').width * 0.8,
                        height: Dimensions.get('screen').height * 0.8,
                        backgroundColor: '#e8eaeb',
                        paddingLeft: scale(40),
                        paddingRight: scale(40),
                        paddingTop: scale(0),
                        paddingBottom: scale(50)
                    }}>
                        <ModalCloseButton close={this.close}/>
                        <ModalHeader modalName={this.modalName}/>
                        <Row size={18}>
                            <Col size={35} style={{
                                borderRightWidth: 0.2,
                                borderColor: '#404048',
                                marginBottom: scale(20),
                                marginTop: scale(50)
                            }}>
                                <Row size={6.75}>
                                    {this.state.loaded ?
                                        <FlatList
                                            data={this.state.groups}
                                            renderItem={({item}) =>
                                                <ButtonItem text={item.name} intl={this.props.intl}
                                                            onPress={() => this.setActive(item.key)}
                                                            style={[styles.modalButton, {
                                                                backgroundColor: '#404048',
                                                                height: scale(50)
                                                            }]}
                                                            textStyle={styles.modalButtonText}
                                                />}
                                        /> :
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            flex: 1,
                                            alignItems: 'center'
                                        }}>
                                            <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(50)}
                                                             indeterminate={true}/>
                                        </View>
                                    }
                                </Row>
                                <Row size={0.25}/>
                                <Row>
                                    <ButtonItem text="OK" onPress={this.onPressBtn}
                                                style={[styles.modalButton, {backgroundColor: '#3cb671'}]}
                                                textStyle={styles.modalButtonText}/>
                                </Row>
                            </Col>
                            <Col size={65} style={{paddingTop: scale(0), paddingLeft: scale(50)}}>
                                <View style={{height: scale(50), alignItems: 'flex-end'}}>
                                    {this.state.sub_products.length !== 0 &&
                                    <Col size={5}>
                                        <TouchableOpacity style={[styles.flex, {padding: scale(5)}]}
                                                          onPress={() => this.setState({sub_products: []})}>
                                            <Icon style={styles.icon} name="keyboard-backspace" size={scaleText(20)} color="#3f3f48"/>
                                        </TouchableOpacity>
                                    </Col>
                                    }
                                </View>
                                <Row size={7}>
                                    {(!this.state.loaded) ?
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            flex: 1,
                                            alignItems: 'center'
                                        }}>
                                            <Progress.Circle borderWidth={5} borderColor={"#2dab61"} size={scale(60)}
                                                             indeterminate={true}/>
                                        </View> :
                                        this.getItems()
                                    }
                                </Row>
                            </Col>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}


export class SubProductsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false, products: [], sub_products: [], onSuccess: null
        };
        this.modalName = 'app.sub_products';

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.getItems = this.getItems.bind(this);
    }

    open(products, sub_products, onSuccess=null) {
        this.setState({open: true, products: products, sub_products: sub_products, onSuccess: onSuccess});
    }

    close() {
        this.setState({open: false, products: [], sub_products: []})
    }

    getItems() {
        let products = Object.keys(this.state.sub_products).map((key) => {
            return this.state.products ? {...this.state.products[key], key: key} : null;
        });

        let perRow = 4,
            rows = 4,
            perSlide = 16,
            slides = Math.ceil(products.length / perSlide);
        if (products.length === 0) {
            return <Col><Text style={styles.textDark}>{this.props.intl.messages['app.noGroupProducts']}</Text></Col>
        }
        return (
            <SwipeALot circleDefaultStyle={{...plainStyles.dotStyleModal}}
                       circleActiveStyle={plainStyles.activeDotStyleModal}>
                {Array.apply(null, {length: slides}).map((d, idxSld) =>
                    <Col style={[styles.slide, {marginBottom: 0}]} key={idxSld}>
                        {Array.apply(null, {length: rows}).map((d, idxRow) =>
                            <Row key={idxRow}>
                                {Array.apply(null, {length: perRow}).map((d, idxItem) => {
                                    let item = products[idxSld * (perSlide - 1) + idxRow * rows + idxItem];
                                    if (item) {
                                        return <IconButton key={item.key} intl={this.props.intl}
                                                           text={item.name} active={true}
                                                           price={`${item.price} DKK`}
                                                           onPress={() => {
                                                               if (this.state.onSuccess) {
                                                                   this.state.onSuccess(item.key)
                                                               } else {
                                                                   this.props.onPress(1, null, item.key);
                                                               }
                                                               this.close();
                                                           }}
                                        />
                                    } else {
                                        return <Col key={idxItem}/>
                                    }
                                })}
                            </Row>
                        )}
                        <Row size={0.1}/>
                    </Col>
                )}
            </SwipeALot>
        )
    }

    render() {
        return (
            <Modal
                onRequestClose={this.close}
                visible={this.state.open}
                style={styles.modal}
            >
                <TouchableOpacity style={styles.overlay} onPress={this.close}>
                    <TouchableOpacity activeOpacity={1} onPress={(event) => event.stopPropagation()} style={{
                        position: 'absolute',
                        top: Dimensions.get('screen').height * 0.1,
                        left: Dimensions.get('screen').width * 0.1,
                        width: Dimensions.get('screen').width * 0.8,
                        height: Dimensions.get('screen').height * 0.8,
                        backgroundColor: '#e8eaeb',
                        paddingLeft: scale(40),
                        paddingRight: scale(40),
                        paddingTop: scale(0),
                        paddingBottom: scale(50)
                    }}>
                        <ModalCloseButton close={this.close}/>
                        <Row size={15}>
                            <Col size={65} style={{paddingTop: scale(0), paddingLeft: scale(10)}}>
                                <Row size={7}>
                                    {this.getItems()}
                                </Row>
                            </Col>
                        </Row>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        )
    }
}
