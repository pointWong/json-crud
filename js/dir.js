const fs = require('fs');

function readDir(path) {
    try {
        return fs.readdirSync(path);
    } catch (error) {
        console.log(error)
    }
}
module.exports = { readDir }