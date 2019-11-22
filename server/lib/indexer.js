const fs = require('fs');
const pathConverter = require('path');
const directory = require('../environment/environment').directory;
const initMongo = require('./mongodb').init;

initMongo((error, client) => {
    if (error)
        console.log(error)
    else {
        console.log('Connected files');
        database = client.db().collection('files');
    }
});

/** path => string[] */
function genetatePath(path) {
    let resp = [];
    try {
        const temp = pathConverter.join(fs.realpathSync(directory + '/' + path.join('/')));
        resp = temp.split('/');
    } catch (error) {
        return [];
    }
    if (resp)
        return resp;
    return resp;
}

function indexer() {


}

function deindexer() {

}

function add() {

}

function remove() {

}


module.exports = { indexer }