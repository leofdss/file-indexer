const rimraf = require('rimraf');
const fs = require('fs');

async function deleteElement(path, callback) {
  try {
    if (fs.existsSync(path)) {
      rimraf(path, function () {
        callback(null, { status: 'Element deleted' });
      })
    } else {
      callback(null, { status: 'Element not exist' });
    }
  } catch (error) {
    callback({ error }, null);
  }
}

module.exports = deleteElement;
