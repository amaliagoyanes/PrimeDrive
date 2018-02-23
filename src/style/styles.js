import React from 'react';
import {StyleSheet} from 'react-native';
import {scale, scaleText} from '../scaling';

export default styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    modal: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    box2: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
        marginLeft: scale(10)
    },
    box: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#53535a',
        marginLeft: scale(10),
        marginBottom: scale(15)
    },
    button: {
        flex: 1,
        marginLeft: scale(5),
        marginRight: scale(5),
        marginBottom: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#53535a',
    },
    buttonSidedText: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingRight: scale(15),
        paddingLeft: scale(15)
    },
    tabButton: {
        width: '34%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#404048',
    },
    confirmBtn: {
        width: '50%',
        height: scale(40),
        backgroundColor: '#2dab61'
    },
    declineBtn: {
        width: '50%',
        height: scale(40),
        backgroundColor: '#e84b3a'
    },
    tabInfo: {
        backgroundColor: '#6f7076',
        paddingRight: 10,
        flex: 1, justifyContent: 'center',
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: scale(10),
        borderRightWidth: 0,
        borderBottomWidth: scale(10),
        borderLeftWidth: scale(10),
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#404048',
    },
    leftTriangle: {
        borderRightWidth: scale(10),
        borderLeftWidth: 0,
        borderRightColor: '#404048',
        borderLeftColor: 'transparent',
    },
    activeColor: {
        backgroundColor: '#6f7076',
    },
    innerButton: {
        marginTop: scale(7),
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        backgroundColor: '#2dab61'
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(15),
    },
    topSlide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: scale(2),
    },
    loginInput: {
        height: scale(40),
        width: '50%',
        color: '#fff',
    },
    text: {
        color: '#fff',
        fontSize: scaleText(14),
        fontFamily: 'Gotham-Book'
    },
    textDark: {
        color: '#3f3f48',
        fontSize: scaleText(14),
        fontFamily: 'Gotham-Book'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#3f3f48',
    },
    icon: {
        flex: 1,
        marginLeft: scale(10),
        marginRight: scale(5),
        marginBottom: scale(10),
        alignItems: 'center',
    },
    timesIcon: {
        backgroundColor: '#3f3f48',
        width: scale(30),
        height: scale(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigTimesIcon: {
        backgroundColor: '#3f3f48',
        width: scale(42),
        height: scale(42),
        alignItems: 'center',
        justifyContent: 'center',
    },
    timesIconRow: {
        height: scale(44),
        marginRight: 10,
        marginLeft: 10,
        padding: 10,
        backgroundColor: '#53535a',
        alignSelf: 'stretch',
        alignItems: 'flex-end',
    },
    progressRow: {
        height: scale(44),
        width: scale(50),
        marginRight: 10,
        marginLeft: 10,
        marginTop: -40,
        padding: 10,
        backgroundColor: '#53535a',
    },
    customerName: {
        fontFamily: 'Gotham-Bold',
        fontSize: scaleText(14),
        color: '#fff',
    },
    customerNameCol: {
        borderBottomWidth: 1,
        borderColor: '#fefefe',
        marginLeft: 15,
        marginRight: 30,
        alignSelf: 'stretch',
        alignItems: 'flex-start'
    },
    baseSideMenuRow: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#53535a'
    },
    sectionHeader: {
        borderBottomWidth: 1,
        borderColor: 'rgba(254,254,254,0.4)',
        marginLeft: 15,
        marginRight: 30,
        paddingBottom: scale(5),
        marginBottom: scale(10),
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    listViewRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        marginLeft: scale(15),
        marginRight: scale(30),
        height: scale(45),
        paddingLeft: scale(5),
        paddingRight: scale(5),
        marginBottom: scale(5),
    },
    listViewActionRow: {
        backgroundColor: '#3f3f48',
        marginLeft: scale(20),
        paddingLeft: 10
    },
    listViewActionButton: {
        width: '28%',
        height: scale(35),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        top: -8,
        right: -10
    },
    sectionProduct: {
        width: '45%',
        fontSize: scaleText(12),
    },
    sectionUnits: {
        width: '25%',
        textAlign: 'right',
        fontSize: scaleText(12),
    },
    sectionDiscount: {
        width: '70%',
        fontSize: scaleText(10),
    },
    sectionDiscountPrice: {
        width: '30%',
        textAlign: 'right',
        fontSize: scaleText(10),
    },
    sectionTotalPrice: {
        width: '30%',
        textAlign: 'right',
        fontSize: scaleText(12),
    },
    sectionReceiptProduct: {
        fontSize: scaleText(12),
        color: '#6a6a6a',
        width: '60%'
    },
    sectionReceiptProductPrice: {
        fontSize: scaleText(12),
        textAlign: 'right',
        color: '#6a6a6a',
        width: '40%'
    },
    sectionReceiptCampaign: {
        fontSize: scaleText(10),
        color: '#6a6a6a',
        width: '60%'
    },
    sectionReceiptCampaignAmount: {
        fontSize: scaleText(10),
        color: '#6a6a6a',
        width: '40%',
        textAlign: 'right',
    },
    receiptTotalsLeftCol: {
        width: '30%'
    },
    receiptTotalsRightCol: {
        width: '70%',
        textAlign: 'right',
    },
    receiptTotals: {
        paddingTop: scale(10),
        borderTopWidth: 1,
        borderColor: 'rgba(254,254,254,0.4)',
        marginLeft: scale(15),
        marginRight: scale(30),
    },
    receiptTotalsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: scale(7),
    },
    closedReceiptHeader: {
        marginLeft: 15,
        marginRight: 15,
        marginTop: scale(15),
    },
    closedReceiptBody: {
        marginLeft: 15,
    },
    modalHeader: {
        borderBottomWidth: 0.2,
        borderColor: '#404048',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalButton: {
        marginRight: scale(40),
        marginLeft: 0
    },
    modalButtonText: {
        color: '#fefefe',
        fontSize: scaleText(16),
    },
    numpadButton: {
        backgroundColor: '#494951',
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
    },
    numpadButtonBackground: {
        backgroundColor: '#494951',
    },
    numpadInput: {
        paddingRight: scale(30),
        paddingLeft: scale(10),
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    numpadInputWithPostfix: {
        paddingRight: scale(10),
        paddingLeft: scale(10),
        flex: 0.75,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numpadInputPostfix: {
        paddingRight: scale(10),
        flex: 0.25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userLoginLeft: {
        borderRightWidth: 0.2,
        borderColor: '#404048',
        paddingRight: scale(30),
        marginBottom: scale(20)
    },
    userLoginRight: {
        paddingLeft: scale(30),
        paddingRight: scale(25),
        marginBottom: scale(20)
    },
    userLoginSearchIcon: {
        marginLeft: scale(5),
        height: scale(15),
        width: scale(15),
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    openDayButton: {
        backgroundColor: '#66666d',
        marginRight: scale(15)
    },
    iconButtonBadge: {
        width: scale(20),
        height: scale(20),
        backgroundColor: '#707076',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        right: 0
    },
    tableItemNum: {
        fontFamily: 'Gotham-Bold',
        fontSize: scaleText(14),
        color: '#fefefe'
    },
    tablesLayout: {
        paddingTop: scale(30),
        paddingBottom: scale(40)
    },
    tableItemTime: {
        fontFamily: 'Gotham-Bold',
        fontSize: scaleText(14),
        color: '#fefefe'
    },
    tableItem: {
        marginLeft: scale(32),
        marginRight: scale(32),
    },
    modalActiveArrow: {
        position: 'absolute',
        right: scale(-10),
        width: scale(20),
        height: scale(20),
        transform: [{rotate: '45deg'}]
    },
    receiptModalBody: {
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        backgroundColor: '#ffffff',
        marginTop: scale(10),
        marginBottom: scale(5),
        marginLeft: scale(5),
        marginRight: scale(5),
        paddingTop: scale(10),
        paddingLeft: scale(10),
        paddingRight: scale(10)
    },
    receiptModalHeaderText: {
        fontSize: scaleText(12),
        color: '#6a6a6a',
    },
    tableNameChangeInput: {
        width: "100%",
        height: "100%",
        color: '#313138',
    },
    imageOnButton: {
        resizeMode: 'cover', 
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    buttonReceiptAction: {
        maxHeight: scale(90),
        minHeight: scale(90)
    },
    splitReceiptsHead: {
        color: '#313138',
        fontSize: scaleText(16)
    },
    splitButtonsContainer: {},
    splitReceipt: {
        backgroundColor: '#53535b'
    },
    confirmSplitBtn: {
        backgroundColor: '#2dab61'
    },
    declineSplitBtn: {
        backgroundColor: '#e84b3a'
    },
});
