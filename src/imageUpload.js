import { Platform } from 'react-native'
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from './fbconfig';

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;


export default uploadImage = (uri, filename, bucket = '') => {
    return new Promise((resolve, reject) => {
        if (!filename) filename = uri;
        firebase.storage.uploadFile(`${bucket}/${filename}`, uri, {
            contentType: 'image/jpeg',
            contentEncoding: 'base64',
        }).then((res) => resolve(res.downloadUrl))
            .catch(err => reject(err))
    })
};