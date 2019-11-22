var express = require('express');
var router = express.Router();
const initMongo = require('../lib/mongodb').init;
const convertQuery = require('../lib/mongodb').convertQuery;
const generateID = require('../lib/mongodb').generateID;

let database;

initMongo((error, client) => {
    if (error)
        console.log(error)
    else {
        console.log('Connected database');
        database = client.db().collection('files');
    }
});

/* GET home page. */
router.get('/', function (req, res) {
    let sort = {};
    let query = { $and: [] };
    let skip = Number(req.query.page);
    let limit = Number(req.query.limit);
    skip = skip * limit;
    if (JSON.stringify(req.query) !== '{}') {
        let sortName = req.query.sort;
        if (req.query.order === 'desc') {
            sort[sortName] = -1;
        } else if (req.query.order === 'asc') {
            sort[sortName] = 1;
        }
        if (req.query.search && req.query.search !== '') {
            let regex = { $regex: '.*' + req.query.search + '.*', $options: 'i' };
            query.$and.push({
                $or: [
                    { name: regex },
                    { path: regex },
                ]
            });
        }
    }

    if (req.headers) {
        if (req.headers.query) {
            let q = JSON.parse(req.headers.query);
            if (q) {
                query.$and.push(q);
            }
        }
    }

    query = convertQuery(query);

    database.find(query).sort(sort).limit(limit).skip(skip).toArray((error, result) => {
        if (error) {
            res.status(500).send(result);
        } else {
            for (const item of result) {
                if (!fs.existsSync(genetatePath(item.path.concat([item.name])))) {
                    remove(item._id);
                }
            }
        }
    });
});

module.exports = router;