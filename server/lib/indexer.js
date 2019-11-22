const fs = require('fs');
const pathConverter = require('path');
const directory = require('../environment/environment').directory;
const initMongo = require('./mongodb').init;

let database;

initMongo((error, client) => {
    if (error)
        console.log(error)
    else {
        console.log('Connected files');
        database = client.db().collection('files');
    }
});

/** path => string[] return string */
function genetatePath(path) {
    if (!path) path = [];
    try {
        return pathConverter.join(directory + '/' + path.join('/'));
    } catch (error) {
        console.log(error);
        return '';
    }
}

/** path => string[] */
function indexer(path) {
    if (!path) path = [];
    console.log('path', genetatePath(path));
    try {
        const files = fs.readdirSync(genetatePath(path));
        for (const file of files) {
            const stat = fs.statSync(genetatePath(path.concat([file])));
            if (stat.isDirectory()) {
                indexer(path.concat([file]));
            } else {
                add(path, file);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function deindexer() {
    try {
        database.find().toArray((error, result) => {
            if (error) {
                console.log(error);
            } else {
                for (const item of result) {
                    if (!fs.existsSync(genetatePath(item.path.concat([item.name])))) {
                        remove(item._id);
                    }
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

/** 
 * path => string[] 
 * name => string
 * */
function add(path, name) {
    try {
        database.findOne({ path, name }, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                if (!result) {
                    database.insertOne({ name, path }, (error, result) => {
                        if (error) console.log(error);
                    });
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

/** _id => ObjectID */
function remove(_id) {
    try {
        database.deleteOne({ _id }, (error, result) => {
            if (error) console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}


module.exports = { indexer, deindexer }