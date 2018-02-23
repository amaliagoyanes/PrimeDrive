import Firestack from 'react-native-firestack'
import axios from 'axios';

const firestack = new Firestack();
const storageBucket = 'bware-b3753.appspot.com';
firestack.storage.setStorageUrl(`${storageBucket}`);

export default firestack;

export const urlBase = 'https://y0pxbyqod8.execute-api.us-east-1.amazonaws.com';
export const urlSecond = 'https://vsm83yzu80.execute-api.eu-central-1.amazonaws.com';

function retryFailedRequest (err) {
    err.config.url = err.config.url.replace(/.*com/, urlSecond);
    if (err.config && !err.config.__isRetryRequest) {
        err.config.__isRetryRequest = true;
        return axios(err.config);
    }
    throw err;
}
axios.interceptors.response.use(undefined, retryFailedRequest);