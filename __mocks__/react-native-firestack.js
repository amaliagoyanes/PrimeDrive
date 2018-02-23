export const promisify = (fn, NativeModule) => (...args) => jest.fn();

export default promisify