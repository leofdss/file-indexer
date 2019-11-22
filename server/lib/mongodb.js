const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = require('../environment/environment').database;
const config = require('../environment/environment').config;

/** ./mongod --dbpath C:\Code\mongodb\data\db */
function init(callback) {
    console.log(url)
    MongoClient.connect(url, config, function (err, client) {
        if (err) {
            callback(err);
        } else {
            callback(null, client);
        }
    });
}

function convertQuery(object) {
    let props = Object.getOwnPropertyNames(object);
    for (let i = 0; i < props.length; i++) {
        let propName = props[i];
        if (Array.isArray(object[propName])) {
            for (let obj of object[propName]) {
                obj = convertQuery(obj)
            }
        } else if (typeof object[propName] === 'object') {
            object[propName] = convertQuery(object[propName]);
        } else if (propName === '_id') {
            object[propName] = generateID(object[propName]);
        }
    }
    return object;
}

function generateID(value) {
    let id;
    try {
        id = ObjectId(value);
    } catch (error) {
        return '';
    }
    if (id) {
        return id;
    }
    return '';
}

function getNextId(db, collectionName, callback) {
    db.collection('aux.count').findAndModify(
        { _id: collectionName, field: 'id' },
        null,
        { $inc: { seq: 1 } },
        { upsert: true, new: true },
        function (err, result) {
            if (err) {
                if (err.code === 11000) {
                    process.nextTick(getNextId.bind(null, db, collectionName, callback)); // eslint-disable-line
                } else {
                    callback(err);
                }
            } else {
                if (result.value && result.value.seq) {
                    callback(null, result.value.seq);
                } else {
                    callback(null, result.seq);
                }
            }
        }
    );
}

module.exports = { init, convertQuery, generateID, getNextId }
