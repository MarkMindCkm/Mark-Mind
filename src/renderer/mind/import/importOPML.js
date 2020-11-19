var opmlToJSON = require('opml-to-json');
const importOPML = (str) => {
    return new Promise((resolve, reject) => {
        opmlToJSON(str, (err, json) => {
            if (err) reject(err);
            resolve(json);
        });
    });
}

export default importOPML;