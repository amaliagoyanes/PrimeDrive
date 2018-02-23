import React from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    TextInput,
    Image,
} from 'react-native';
import {connect} from 'react-redux';
import {injectIntl, intlShape, FormattedMessage} from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Col, Row} from 'react-native-easy-grid';
import styles from '../../../style/styles';
import {scale, scaleText} from '../../../scaling';

export class IconButton extends React.Component {
    onPress() {
        if (this.props.measures)
            this._btn.measure((fx, fy, width, height, px, py) => {
                this.props.onPress(px, py, width, height, fx, fy);
            });
        else
            this.props.onPress();
    }

    render() {
        let props = this.props;
        let text = this.props.price;
        if (this.props.intl !== undefined && this.props.intl.messages !== undefined && this.props.intl.messages[this.props.price])
            text = this.props.intl.messages[this.props.price];
        return (
            <Col>
                <TouchableOpacity
                    onLongPress={() => {
                        console.log('this.props.onLongPress');
                        if (this.props.onLongPress)
                            this.props.onLongPress();
                    }} onPress={() => this.onPress()} ref={elt => this._btn = elt}
                    style={props.active ? [styles.button, styles.activeColor, props.style] : [styles.button, props.style]}>
                    {props.image !== undefined &&
                    <Image source={{uri: props.image}} style={[styles.imageOnButton]}></Image>
                    }
                    {props.badge !== undefined &&
                    <View style={styles.iconButtonBadge}>
                        <Text style={[styles.text, {fontSize: scaleText(10)}]}>{props.badge}</Text>
                    </View>
                    }
                    {props.status !== undefined &&
                    <View style={[styles.iconButtonBadge, {backgroundColor: props.status ? '#2dab61' : '#707076'}]}/>
                    }
                    {props.icon !== undefined &&
                    <Icon size={scaleText(18)} name={props.icon} color="white"/>}
                    {props.text !== undefined &&
                    <Text
                        style={[styles.text, {
                            textAlign: 'center',
                            fontSize: scaleText(12)
                        }]}>{props.text.toUpperCase()}</Text>}
                    {props.price !== undefined &&
                    <Text style={[styles.text, {
                        textAlign: 'center',
                        fontSize: scaleText(10)
                    }]}>{text.toUpperCase()}</Text>}
                </TouchableOpacity>
            </Col>
        )
    }
}

export class ButtonItem extends React.Component {
    render() {
        let props = this.props;
        let text = this.props.text;
        if (this.props.intl !== undefined && this.props.intl.messages !== undefined && this.props.intl.messages[this.props.text])
            text = this.props.intl.messages[this.props.text];
        return (
            <Col>
                <TouchableOpacity onPress={props.onPress}
                                  activeOpacity={props.disabled !== undefined && props.disabled ? 1 : 0.2}
                                  style={props.active ? [styles.button, styles.activeColor, props.style] : [styles.button, props.style]}>
                    <Text style={[styles.text, props.textStyle]}>{text.toUpperCase()}</Text>
                    {props.detailsText &&
                    <Text style={[styles.text, props.textStyle, {textAlign: 'right'}]}>{props.detailsText}</Text>
                    }
                    {props.modalActive &&
                    <View
                        style={[styles.modalActiveArrow, {backgroundColor: props.style[props.style.length - 1] ? props.style[props.style.length - 1].backgroundColor : props.active ? '#6f7076' : '#53535a'}]}/>
                    }
                </TouchableOpacity>
            </Col>
        )
    }
}

export class TwoTextButtonItem extends React.Component {
    render() {
        let props = this.props;
        let text = this.props.text;
        if (this.props.intl !== undefined && this.props.intl.messages !== undefined && this.props.intl.messages[this.props.text])
            text = this.props.intl.messages[this.props.text];
        return (
            <Col>
                <TouchableOpacity onPress={props.onPress}
                                  activeOpacity={props.disabled !== undefined && props.disabled ? 1 : 0.2}
                                  style={props.active ? [styles.button, styles.activeColor, props.style] : [styles.button, props.style]}>
                    <Row>
                        <Col style={{width: '70%', marginLeft: scale(10), justifyContent: 'center',}}>
                            <Text
                                style={[styles.text, props.textStyle, {textAlign: 'left'}]}>{text.toUpperCase()}</Text>
                        </Col>
                        {props.detailsText &&
                        <Col style={{marginRight: scale(10), justifyContent: 'center',}}>
                            <Text
                                style={[styles.text, props.textStyle, {textAlign: 'right'}]}>{props.detailsText}</Text>
                        </Col>
                        }
                    </Row>
                </TouchableOpacity>
            </Col>
        )
    }
}


export class ButtonMeasures extends React.Component {
    onPress() {
        this._btn.measure((fx, fy, width, height, px, py) => {
            this.props.onLongPress(px, py);
        });
    }

    render() {
        let props = this.props;
        let text = this.props.text;
        if (this.props.intl !== undefined && this.props.intl.messages !== undefined && this.props.intl.messages[this.props.text])
            text = this.props.intl.messages[this.props.text];
        return (
            <Col>
                <TouchableOpacity onLongPress={() => this.onPress()} ref={elt => this._btn = elt}
                                  onPressIn={() => {
                                      this.lastTimePressIn = new Date().getTime();
                                  }}
                                  onPressOut={() => {
                                      let time = new Date().getTime();
                                      let diff = time - this.lastTimePressIn;
                                      if (diff < 500) {
                                          if (this.props.onPress !== undefined && this.props.onDoublePress === undefined)
                                              this.props.onPress();
                                          else if (this.lastTimePress && time - this.lastTimePress < 1500) {
                                              if (this.props.onDoublePress !== undefined)
                                                  this.props.onDoublePress();
                                              delete this.lastTimePress;
                                          } else {
                                              this.lastTimePress = time;
                                          }
                                      }
                                  }}
                                  style={props.active ? [styles.button, styles.activeColor, props.style] : [styles.button, props.style]}>
                    <Text style={[styles.text, props.textStyle]}>{text.toUpperCase()}</Text>
                    {(props.detailsText &&
                        <Text style={[styles.text, props.textStyle, {textAlign: 'right'}]}>{props.detailsText}</Text>
                    )}
                </TouchableOpacity>
            </Col>
        );
    }
}

export const TableItem = (props) => (
    <Col>
        <TouchableOpacity onPress={props.onPress}
                          style={[styles.button, styles.tableItem, props.style]}>
            <Row style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={[styles.text, styles.tableItemNum, props.textStyle]}>{props.num}</Text>
            </Row>

            <Row style={{alignItems: 'center', justifyContent: 'center'}}>
                {(props.time &&
                    <Text
                        style={[styles.text, {
                            fontSize: scaleText(10),
                            color: '#fefefe'
                        }, props.textStyle]}>{props.time}</Text>
                )}
            </Row>
        </TouchableOpacity>
    </Col>
);
