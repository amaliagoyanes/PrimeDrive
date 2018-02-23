import React from 'react';
import {scale, scaleText} from '../scaling';

const styles = {
    dotStyle: {
        top: -2,
        width: scale(8),
        height: scale(8),
        backgroundColor: 'transparent', margin: scale(7), marginTop: scale(3),
        borderRadius: scale(10),
        borderColor: '#beb3b7', borderWidth: 1,
    },
    dotStyleModal: {
        top: -2,
        width: scale(8),
        height: scale(8),
        backgroundColor: 'transparent', margin: scale(7), marginTop: scale(3),
        borderRadius: scale(10),
        borderColor: '#404048', borderWidth: 1,
    },
    activeDotStyle: {
        backgroundColor: '#beb3b7'
    },
    activeDotStyleModal: {
        backgroundColor: '#404048'
    },
    headerHeight: {
        height: 32
    }
};
export default styles;