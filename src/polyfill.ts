import 'array-flat-polyfill';

Promise.wait = function (timeout) {
    return new Promise(res => {
        setTimeout(res, timeout)
    });
}