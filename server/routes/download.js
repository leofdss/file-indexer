var express = require('express');
var router = express.Router();
const v4 = require('uuid/v4');
const permission = require('../middleware/permission');
const generateFileUrl = require('../lib/url').generateFileUrl;
const zipFolder = require('zip-folder');
const rm = require('../lib/rm');

const keys = [];

router.post('/', permission(['Download']), async function async(req, res) {
  try {
    let path = req.body.path;
    let folder = req.body.folder;
    let key = v4();

    keys.push({
      key, path, folder
    });

    res.status(200).send({ key });

  } catch (error) {
    res.status(500).send('error');
  }
});

router.get('/*', async function async(req, res) {
  try {
    let key = req.params[0];
    let id = keys.findIndex(obj => obj.key == key);

    if (id == -1) {
      res.status(404).send('File not exist!');
    } else {
      if (keys[id].path) {
        let path = generateFileUrl(keys[id].path);

        res.download(path);
        if (req.method == 'GET') {
          keys.splice(id, 1);
        }

      } else if (keys[id].folder) {
        const file = __dirname + '/' + v4() + '.zip';
        zipFolder(generateFileUrl(keys[id].folder), file, function (error) {
          if (error) {
            res.status(500).send({ error });
          } else {
            res.download(file, 'arquivos.zip', function (err) {
              rm(file, (error, result) => {
                if (error) console.log(error);
              });
            });
          }
        });
      } else {
        res.status(404).send('File not exist!');
      }
    }
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;