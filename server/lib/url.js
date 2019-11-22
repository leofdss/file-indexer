const pathConveter = require('path');
const fs = require('fs');
const directory = require('../environment/environment').directory;

function generateFileUrl(url) {
    let resp;
    try {
        resp = pathConveter.join(fs.realpathSync(directory + '/' + url));
    } catch (error) {
        return '';
    }
    if (resp)
        return resp;
    return url;
}

function generateUrl(url) {
    resp = directory + '/' + url;
    while (resp.includes('//')) {
        resp = resp.replace('//', '/');
    }
    return resp;
}

module.exports = { generateUrl, generateFileUrl };
