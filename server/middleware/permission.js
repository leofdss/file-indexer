const permission = (array) => {
    return (req, res, next) => {
        if (!req.headers.authorization) {
            res.status(401).send({ error: 'required authorization' });
        } else {
            console.log('permission: ', array);
            if (req.headers.authorization === '123') {
                next();
            } else {
                res.status(401).send({ error: 'required authorization' });
            }
        }
    }
}

module.exports = permission;
