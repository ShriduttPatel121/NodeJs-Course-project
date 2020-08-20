const fs = require('fs');

const deletefile = (filePath) => {
    fs.unlink(filePath, (error) => {
        if (error) {
            throw new Error('somthing went wrong while deleting');
        }
    })
}

module.exports.deletefile = deletefile;