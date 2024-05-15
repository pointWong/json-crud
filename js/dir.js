const fs = require('fs');

function readDirByPath (path = '/', justDir = true) {
    try {
        const dirfile = fs.readdirSync(path);
        if (justDir) {
            return dirfile.filter(file => !file.startsWith('.')).filter(file => fs.statSync((path.endsWith('/') ? path : path + '/') + file).isDirectory())
        }
        return dirfile
    } catch (error) {
        console.log(error)
    }
}
module.exports = { readDirByPath }